import { Module } from '@/app/admin/modules/modules.interface';
import { ModulesService } from '@/app/admin/modules/modules.service';
import { BlockType, DynamicType, QuestionType } from '@/app/admin/questions/questions.interface';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

export interface QuestionFormData {
  id: number | undefined;
  blockType: BlockType;
  statement: string;
  description?: string;
  resourceUrl?: string;
  dynamicType: DynamicType;
  questionType: QuestionType;
  feedback: string;
  moduleId: number;
}

@Component({
  selector: 'app-question-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.css']
})
export class QuestionFormComponent implements OnInit {
  @Input() question: QuestionFormData = {
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
  @Input() isEditMode = false;
  @Output() questionSubmitted = new EventEmitter<QuestionFormData>();

  questionForm: FormGroup;
  BlockType = BlockType;
  DynamicType = DynamicType;
  QuestionType = QuestionType;
  modules: Module[] = [];
  loadingModules = false;

  constructor(
    private fb: FormBuilder,
    private modulesService: ModulesService
  ) {
    this.questionForm = this.fb.group({
      id: [null],
      blockType: [BlockType.TEXT, Validators.required],
      statement: ['', [Validators.required, Validators.minLength(5)]],
      description: [''],
      resourceUrl: [''],
      dynamicType: [DynamicType.MULTIPLE_CHOICE, Validators.required],
      questionType: [QuestionType.KNOWLEDGE_CHECK, Validators.required],
      feedback: ['', [Validators.required, Validators.minLength(10)]],
      moduleId: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadModules();
    this.questionForm.patchValue(this.question);
  }

  onSubmit(): void {
    if (this.questionForm.valid) {
      const formData = this.questionForm.value;
      if (!this.isEditMode || !formData.id) {
        delete formData.id;
      }
      this.questionSubmitted.emit(formData);
    }
  }

  loadModules(): void {
    this.loadingModules = true;
    this.modulesService.getModules({ limit: 100 }).subscribe({
      next: (response) => {
        this.modules = response.data;
        this.loadingModules = false;
      },
      error: (err) => {
        console.error('Error loading modules', err);
        this.loadingModules = false;
      }
    });
  }

  get form(): FormGroup {
    return this.questionForm;
  }

  submitForm(): void {
    this.onSubmit();
  }
}