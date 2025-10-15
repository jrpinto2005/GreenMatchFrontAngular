import { AsyncPipe, CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLatest, map, Observable, shareReplay } from 'rxjs';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { BarraInferiorComponent } from '../barra-inferior/barra-inferior.component';
import {
  CareEvent,
  CareEventCreate,
  CareEventType,
  CareScheduleService
} from './care-schedule.service';
import { PlantCatalogService } from './plant-catalog.service';

interface CareEventView extends CareEvent {
  plantName: string;
  typeLabel: string;
  statusLabel: string;
  isPast: boolean;
  isOverdue: boolean;
}

interface CareEventGroup {
  date: Date;
  label: string;
  isToday: boolean;
  items: CareEventView[];
}

interface ScheduleViewModel {
  groups: CareEventGroup[];
  pendingCount: number;
  nextEvent?: CareEventView;
}

@Component({
  selector: 'app-mi-horario',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    CommonModule,
    DatePipe,
    NgFor,
    NgIf,
    ReactiveFormsModule,
    BarraSuperiorComponent,
    BarraInferiorComponent
  ],
  templateUrl: './mi-horario.component.html',
  styleUrls: ['./mi-horario.component.scss']
})
export class MiHorarioComponent {
  private readonly scheduleService = inject(CareScheduleService);
  private readonly plantCatalogService = inject(PlantCatalogService);
  private readonly fb = inject(FormBuilder);

  readonly isFormOpen = signal(false);
  readonly isEditing = signal(false);
  readonly selectedEventId = signal<number | null>(null);

  readonly reminderForm = this.fb.group({
    id: this.fb.control<number | null>(null),
    plantId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
    title: this.fb.control('', {
      validators: [Validators.required, Validators.maxLength(60)]
    }),
    type: this.fb.control<CareEventType>('watering', { validators: [Validators.required] }),
    date: this.fb.control('', { validators: [Validators.required] }),
    time: this.fb.control('', { validators: [Validators.required] }),
    notes: this.fb.control('', { validators: [Validators.maxLength(240)] })
  });

  readonly typeOptions = TYPE_OPTIONS;

  private readonly formatter = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  private readonly events$ = this.scheduleService.getEvents();
  private readonly plantsSource$ = this.plantCatalogService
    .getPlants()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  readonly plants$ = this.plantsSource$;

  readonly eventViews$: Observable<CareEventView[]> = combineLatest([
    this.events$,
    this.plantsSource$
  ]).pipe(
    map(([events, plants]) => {
      const now = new Date();
      const plantIndex = new Map(plants.map((plant) => [plant.id, plant.name]));

      return events
        .map((event) => {
          const plantName = plantIndex.get(event.plantId) ?? 'Planta sin nombre';
          const typeLabel = TYPE_LABELS.get(event.type) ?? capitalise(event.type);
          const isPast = event.scheduledAt.getTime() < now.getTime();
          const isOverdue = !event.completed && isPast;
          const statusLabel = event.completed ? 'Completado' : isOverdue ? 'Atrasado' : 'Pendiente';

          return {
            ...event,
            plantName,
            typeLabel,
            statusLabel,
            isPast,
            isOverdue
          };
        })
        .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
    })
  );

  readonly viewModel$: Observable<ScheduleViewModel> = this.eventViews$.pipe(
    map((events) => {
      const now = new Date();
      const groupsMap = new Map<string, CareEventGroup>();

      for (const event of events) {
        const key = toDateKey(event.scheduledAt);
        if (!groupsMap.has(key)) {
          const date = startOfDay(event.scheduledAt);
          groupsMap.set(key, {
            date,
            label: buildLabel(date, now, this.formatter),
            isToday: isSameDay(date, now),
            items: []
          });
        }

        groupsMap.get(key)!.items.push(event);
      }

      const groups = Array.from(groupsMap.values()).sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );

      const pending = events.filter((event) => !event.completed);
      const nextEvent = events.find((event) => !event.completed && !event.isPast) ?? pending[0];

      return {
        groups,
        pendingCount: pending.length,
        nextEvent
      };
    })
  );

  readonly selectedEvent$ = combineLatest([
    this.eventViews$,
    toObservable(this.selectedEventId)
  ]).pipe(
    map(([events, selectedId]) => events.find((event) => event.id === selectedId) ?? null)
  );

  readonly formTitle = signal('Nuevo recordatorio');

  openEventDetails(eventId: number): void {
    this.selectedEventId.set(eventId);
    this.isFormOpen.set(false);
    this.isEditing.set(false);
  }

  startCreateReminder(): void {
    const defaultDate = formatDateInputValue(new Date());

    this.reminderForm.reset({
      id: null,
      plantId: null,
      title: '',
      type: 'watering',
      date: defaultDate.date,
      time: defaultDate.time,
      notes: ''
    });

    this.selectedEventId.set(null);
    this.isEditing.set(false);
    this.isFormOpen.set(true);
    this.formTitle.set('Nuevo recordatorio');
  }

  startEditReminder(event: CareEventView): void {
    const { date, time } = formatDateInputValue(event.scheduledAt);

    this.reminderForm.reset({
      id: event.id,
      plantId: event.plantId,
      title: event.title,
      type: event.type,
      date,
      time,
      notes: event.notes ?? ''
    });

    this.selectedEventId.set(event.id);
    this.isEditing.set(true);
    this.isFormOpen.set(true);
    this.formTitle.set('Editar recordatorio');
  }

  submitReminder(): void {
    if (this.reminderForm.invalid) {
      this.reminderForm.markAllAsTouched();
      return;
    }

    const raw = this.reminderForm.getRawValue();
    const scheduledAt = buildDateFromInputs(raw.date ?? '', raw.time ?? '');

    if (!scheduledAt) {
      return;
    }

    const payload: CareEventCreate = {
      plantId: Number(raw.plantId),
      title: raw.title?.trim() ?? '',
      type: raw.type ?? 'watering',
      scheduledAt,
      notes: raw.notes?.trim() ? raw.notes.trim() : undefined
    };

    if (this.isEditing()) {
      const id = raw.id;
      if (id != null) {
        this.scheduleService.updateEvent(id, payload);
        this.selectedEventId.set(id);
      }
    } else {
      const created = this.scheduleService.addEvent(payload);
      this.selectedEventId.set(created.id);
    }

    this.isFormOpen.set(false);
    this.isEditing.set(false);
    this.reminderForm.reset();
    this.formTitle.set('Nuevo recordatorio');
  }

  deleteEvent(event: CareEventView): void {
    const confirmed = window.confirm(`¿Eliminar el recordatorio “${event.title}”?`);
    if (!confirmed) {
      return;
    }

    this.scheduleService.deleteEvent(event.id);
    if (this.selectedEventId() === event.id) {
      this.selectedEventId.set(null);
    }
    this.isFormOpen.set(false);
    this.isEditing.set(false);
    this.formTitle.set('Nuevo recordatorio');
  }

  toggleCompletion(event: CareEventView): void {
    this.scheduleService.toggleCompleted(event.id);
  }

  closePanels(): void {
    this.isFormOpen.set(false);
    this.isEditing.set(false);
    this.selectedEventId.set(null);
    this.reminderForm.reset();
    this.formTitle.set('Nuevo recordatorio');
  }
}

const TYPE_LABELS = new Map<CareEventType, string>([
  ['watering', 'Riego'],
  ['fertilize', 'Fertilizacion'],
  ['prune', 'Poda'],
  ['mist', 'Pulverizar hojas'],
  ['checkup', 'Revision de plagas']
]);

const TYPE_OPTIONS = Array.from(TYPE_LABELS.entries()).map(([value, label]) => ({
  value,
  label
}));

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildLabel(date: Date, reference: Date, formatter: Intl.DateTimeFormat): string {
  if (isSameDay(date, reference)) {
    return 'Hoy';
  }

  const tomorrow = new Date(reference);
  tomorrow.setDate(reference.getDate() + 1);

  if (isSameDay(date, tomorrow)) {
    return 'Manana';
  }

  const formatted = formatter.format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatDateInputValue(date: Date): { date: string; time: string } {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`
  };
}

function buildDateFromInputs(dateInput: string, timeInput: string): Date | null {
  if (!dateInput || !timeInput) {
    return null;
  }

  const [year, month, day] = dateInput.split('-').map((segment) => Number(segment));
  const [hours, minutes] = timeInput.split(':').map((segment) => Number(segment));

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return null;
  }

  return new Date(year, month - 1, day, hours, minutes);
}

function capitalise(value: string): string {
  if (!value) {
    return '';
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}
