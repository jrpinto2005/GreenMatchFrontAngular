import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, shareReplay } from 'rxjs';

export type CareEventType = 'watering' | 'fertilize' | 'prune' | 'mist' | 'checkup' | string;

export interface CareEvent {
  id: number;
  plantId: number;
  title: string;
  type: CareEventType;
  scheduledAt: Date;
  completed: boolean;
  notes?: string;
}

export interface CareEventCreate {
  plantId: number;
  title: string;
  type: CareEventType;
  scheduledAt: Date;
  notes?: string;
}

export type CareEventUpdate = Partial<Omit<CareEvent, 'id'>>;

interface CareEventResponse {
  events: Array<Omit<CareEvent, 'scheduledAt'> & { scheduledAt: string }>;
}

@Injectable({
  providedIn: 'root'
})
export class CareScheduleService {
  private readonly http = inject(HttpClient);
  private readonly dataUrl = 'assets/data/care-events.json';
  private readonly eventsSubject = new BehaviorSubject<CareEvent[]>([]);
  private isLoaded = false;

  readonly events$ = this.eventsSubject.asObservable().pipe(shareReplay({ bufferSize: 1, refCount: true }));

  constructor() {
    void this.loadInitialEvents();
  }

  private loadInitialEvents(): void {
    if (this.isLoaded) {
      return;
    }

    this.http
      .get<CareEventResponse>(this.dataUrl)
      .pipe(
        map(({ events }) =>
          events.map((event) => ({
            ...event,
            scheduledAt: new Date(event.scheduledAt)
          }))
        )
      )
      .subscribe({
        next: (events) => {
          this.isLoaded = true;
          this.eventsSubject.next(events);
        },
        error: (error) => {
          console.error('No se pudieron cargar los eventos iniciales del calendario', error);
        }
      });
  }

  getEvents(): Observable<CareEvent[]> {
    return this.events$;
  }

  getSnapshot(): CareEvent[] {
    return this.eventsSubject.getValue();
  }

  addEvent(input: CareEventCreate): CareEvent {
    const newEvent: CareEvent = {
      ...input,
      id: this.createIdentifier(),
      completed: false
    };

    this.eventsSubject.next([...this.getSnapshot(), newEvent]);
    return newEvent;
  }

  updateEvent(id: number, changes: CareEventUpdate): void {
    this.eventsSubject.next(
      this.getSnapshot().map((event) =>
        event.id === id
          ? {
              ...event,
              ...changes
            }
          : event
      )
    );
  }

  deleteEvent(id: number): void {
    this.eventsSubject.next(this.getSnapshot().filter((event) => event.id !== id));
  }

  toggleCompleted(id: number): void {
    this.eventsSubject.next(
      this.getSnapshot().map((event) =>
        event.id === id
          ? {
              ...event,
              completed: !event.completed
            }
          : event
      )
    );
  }

  private createIdentifier(): number {
    const events = this.getSnapshot();
    const maxId = events.length > 0 ? Math.max(...events.map((event) => event.id)) : 100;
    return maxId + 1;
  }
}
