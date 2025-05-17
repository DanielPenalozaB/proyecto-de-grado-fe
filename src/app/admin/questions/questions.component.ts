import { QuestionFormComponent, QuestionFormData } from '@/app/feature/admin/questions/question-form/question-form.component';
import {
  UbDialogCloseDirective,
  UbDialogContentDirective,
  UbDialogDescriptionDirective,
  UbDialogFooterDirective,
  UbDialogHeaderDirective,
  UbDialogTitleDirective
} from '@/components/ui/dialog';
import { DialogService } from '@/components/ui/dialog.service';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FunnelX, LucideAngularModule, Plus, Search, Trash2 } from 'lucide-angular';
import { toast } from "ngx-sonner";
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ContentLayoutComponent } from '../../shared/layout/content-layout/content-layout.component';
import { TableComponent } from "../../shared/ui/table/table.component";
import { Pagination, TableAction, TableColumn } from '../../shared/ui/table/table.interfaces';
import { ModulesService } from '../modules/modules.service';
import { BlockType, DynamicType, Question, QuestionType } from './questions.interface';
import { QuestionSearchParams, QuestionsService } from './questions.service';

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ContentLayoutComponent,
    TableComponent,
    LucideAngularModule,
    QuestionFormComponent,
    UbDialogContentDirective,
    UbDialogDescriptionDirective,
    UbDialogFooterDirective,
    UbDialogHeaderDirective,
    UbDialogTitleDirective,
    UbDialogCloseDirective
  ],
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit, OnDestroy {
  @ViewChild('createDialog', { static: true }) createDialogTpl!: TemplateRef<unknown>;
  @ViewChild('editDialog', { static: true }) editDialogTpl!: TemplateRef<unknown>;
  @ViewChild('deleteDialog', { static: true }) deleteDialogTpl!: TemplateRef<unknown>;
  @ViewChild('createQuestionForm') createQuestionForm!: QuestionFormComponent;
  @ViewChild('editQuestionForm') editQuestionForm!: QuestionFormComponent;

  readonly Search = Search;
  readonly FunnelX = FunnelX;

  questions: Question[] = [];
  loading = false;
  currentQuestion: QuestionFormData = {
    id: undefined,
    blockType: BlockType.TEXT,
    statement: '',
    description: '',
    resourceUrl: '',
    dynamicType: DynamicType.MULTIPLE_CHOICE,
    questionType: QuestionType.KNOWLEDGE_CHECK,
    feedback: '',
    moduleId: 0
  };

  searchSubject = new Subject<string>();
  searchTerm = '';
  filterParams: QuestionSearchParams = {};

  sortableFields: Record<string, string> = {
    'id': 'ID',
    'createdAt': 'Fecha creación',
    'updatedAt': 'Fecha actualización'
  };

  pagination: Pagination = {
    page: 1,
    limit: 10,
    pageCount: 1,
    total: 0,
    hasNextPage: false,
    hasPreviousPage: false
  };

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    {
      key: 'statement',
      label: 'Enunciado',
      class: 'w-2xs!',
      truncate: true,
    },
    {
      key: 'blockType',
      label: 'Tipo de Bloque',
      type: 'badge',
      format: <BlockType>(value: BlockType) => {
        switch (value) {
          case BlockType.TEXT: return 'Texto';
          case BlockType.VIDEO: return 'Video';
          case BlockType.IMAGE: return 'Imagen';
          case BlockType.QUESTION: return 'Pregunta';
          default: return 'N/A';
        }
      }
    },
    {
      key: 'dynamicType',
      label: 'Tipo Dinámico',
      type: 'badge',
      format: <DynamicType>(value: DynamicType) => {
        switch (value) {
          case DynamicType.MULTIPLE_CHOICE: return 'Opción múltiple';
          case DynamicType.SINGLE_ANSWER: return 'Respuesta única';
          case DynamicType.DRAG_AND_DROP: return 'Arrastrar y soltar';
          case DynamicType.TEXT_INPUT: return 'Entrada de texto';
          case DynamicType.VIDEO_RESOURCE: return 'Recurso de video';
          default: return 'N/A';
        }
      }
    },
    {
      key: 'questionType',
      label: 'Tipo de Pregunta',
      type: 'badge',
      format: <QuestionType>(value: QuestionType) => {
        switch (value) {
          case QuestionType.KNOWLEDGE_CHECK: return 'Verificación';
          case QuestionType.PRACTICE: return 'Práctica';
          case QuestionType.ASSESSMENT: return 'Evaluación';
          case QuestionType.REFLECTION: return 'Reflexión';
          default: return 'N/A';
        }
      }
    },
    {
      key: 'moduleId',
      label: 'ID Módulo',
      format: (value: unknown) => {
        if (!value) return 'N/A';
        const moduleId = value as number;
        return `<a href="/admin/modules/${moduleId}" class="text-teal-500 hover:text-teal-600 hover:underline">#${moduleId}</a>`;
      }
    },
    {
      key: 'createdAt',
      label: 'Creado',
      type: 'date',
      format: (value: unknown) => new Date(value as string).toLocaleDateString()
    },
    {
      key: 'updatedAt',
      label: 'Modificado',
      type: 'date',
      format: (value: unknown) => new Date(value as string).toLocaleDateString()
    }
  ];

  tableActions: TableAction<Question>[] = [
    {
      label: 'Editar',
      icon: Plus,
      action: (row) => this.openEditDialog(row),
      style: 'text-primary-600 hover:text-primary-900'
    },
    {
      label: 'Eliminar',
      icon: Trash2,
      action: (row) => this.openDeleteDialog(row),
      style: 'text-red-600 hover:text-red-900'
    }
  ];

  contentActions = [
    {
      label: 'Crear pregunta',
      icon: Plus,
      action: () => this.openCreateDialog(),
      style: 'bg-primary text-primary-foreground hover:bg-primary/90'
    }
  ];

  constructor(
    private questionsService: QuestionsService,
    private dialogService: DialogService,
    private modulesService: ModulesService
  ) { }

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((searchTerm: string) => {
      this.searchTerm = searchTerm;
      this.applyFilters();
    });

    this.loadQuestions();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  loadQuestions(): void {
    this.loading = true;

    const params: QuestionSearchParams = {
      ...this.filterParams,
      page: this.pagination.page,
      limit: this.pagination.limit
    };

    if (this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }

    this.questionsService.getQuestions(params).subscribe({
      next: (response) => {
        this.questions = response.data;
        if (response.meta) {
          this.pagination = {
            page: response.meta.pagination.page || 1,
            limit: response.meta.pagination.limit || 10,
            pageCount: response.meta.pagination.pageCount || 1,
            total: response.meta.pagination.total || 0,
            hasNextPage: response.meta.pagination.hasNextPage || false,
            hasPreviousPage: response.meta.pagination.hasPreviousPage || false
          };
        }
        this.loading = false;
      },
      error: (err) => {
        toast.error('Error al obtener las preguntas. Por favor, inténtalo de nuevo.');
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSort(column: string): void {
    if (this.filterParams.sortBy === column) {
      this.filterParams.sortDirection =
        this.filterParams.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.filterParams.sortBy = column as QuestionSearchParams['sortBy'];
      this.filterParams.sortDirection = 'ASC';
    }

    this.pagination.page = 1;
    this.loadQuestions();
  }

  resetFilters(): void {
    this.filterParams = {};
    this.searchTerm = '';
    this.pagination.page = 1;
    this.loadQuestions();
    toast.success('Filtros restablecidos');
  }

  applyFilters(): void {
    this.pagination.page = 1;
    this.loadQuestions();
  }

  openCreateDialog(): void {
    this.currentQuestion = {
      id: undefined,
      blockType: BlockType.TEXT,
      statement: '',
      description: '',
      resourceUrl: '',
      dynamicType: DynamicType.MULTIPLE_CHOICE,
      questionType: QuestionType.KNOWLEDGE_CHECK,
      feedback: '',
      moduleId: 0
    };
    this.dialogService.open(this.createDialogTpl);
  }

  openEditDialog(question: Question): void {
    this.currentQuestion = { ...question };
    this.dialogService.open(this.editDialogTpl);
  }

  openDeleteDialog(question: Question): void {
    this.currentQuestion = { ...question };
    this.dialogService.open(this.deleteDialogTpl);
  }

  onCreateQuestion(questionData: QuestionFormData): void {
    this.loading = true;
    this.questionsService.createQuestion(questionData).subscribe({
      next: (response) => {
        this.questions = [response.data, ...this.questions];
        this.pagination.total++;
        this.dialogService.close();
        this.loading = false;
        toast.success(response.message || 'Pregunta creada exitosamente');
      },
      error: (err) => {
        toast.error(err.error?.message || 'Error al crear la pregunta. Por favor, inténtalo de nuevo.');
        this.loading = false;
        console.error(err);
      }
    });
  }

  onUpdateQuestion(questionData: QuestionFormData): void {
    if (!questionData.id) return;

    this.loading = true;
    this.questionsService.updateQuestion(questionData.id, questionData).subscribe({
      next: (response) => {
        this.questions = this.questions.map(q =>
          q.id === response.data.id ? response.data : q
        );
        this.dialogService.close();
        this.loading = false;
        toast.success(response.message || 'Pregunta actualizada exitosamente');
      },
      error: (err) => {
        toast.error(err.error?.message || 'Error al actualizar la pregunta. Por favor, inténtalo de nuevo.');
        this.loading = false;
        console.error(err);
      }
    });
  }

  onDeleteQuestion(questionData: QuestionFormData): void {
    if (!questionData.id) {
      toast.error('No se puede eliminar la pregunta: ID no válido');
      return;
    }

    this.loading = true;
    this.dialogService.close();

    this.questionsService.deleteQuestion(questionData.id).subscribe({
      next: (response) => {
        this.questions = this.questions.filter(q => q.id !== questionData.id);
        this.pagination.total--;
        toast.success(response.message || 'Pregunta eliminada exitosamente');
        this.loading = false;
      },
      error: (err) => {
        toast.error(err.error?.message || 'Error al eliminar la pregunta. Por favor, inténtalo de nuevo.');
        console.error(err);
        this.loading = false;
      }
    });
  }

  onAction(event: { action: string; row: Question }): void {
    if (event.action === 'Editar') {
      this.openEditDialog(event.row);
    } else if (event.action === 'Eliminar') {
      this.openDeleteDialog(event.row);
    }
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.loadQuestions();
  }

  onPageSizeChange(size: number): void {
    this.pagination.limit = size;
    this.pagination.page = 1;
    this.loadQuestions();
  }
}