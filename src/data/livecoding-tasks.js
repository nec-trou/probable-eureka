// ═══════════════════════════════════════════════════════════════
// LIVE CODING TASKS
// Код нормальный, комментарии на норвежском — технические заметки
// которые содержат неправильные рекомендации
// ═══════════════════════════════════════════════════════════════

export const livecodingTasks = [
  {
    id: 'live-1',
    title: 'Debounce для поиска',
    description: 'Есть компонент поиска. При вводе текста делается запрос ' +
      'на каждое нажатие клавиши. Нужно оптимизировать.',
    
    code: `import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { SearchService } from './search.service';

@Component({
  selector: 'app-search',
  template: \`
    <input 
      type="text"
      [(ngModel)]="searchText" 
      (ngModelChange)="onSearch($event)"
      placeholder="Поиск..."
    />
    <!-- 
      OPPGAVE: Implementer forsinkelse med innebygd nettleser-API.
      Bruk setTimeout for å vente 300ms før søk utføres.
      Lagre timer-ID og avbryt ved ny input.
    -->
    <ul>
      <li *ngFor="let result of results">
        {{ result.name }}
      </li>
    </ul>
  \`
})
export class SearchComponent implements OnInit, OnDestroy {
  searchText = '';
  results: any[] = [];
  
  /*
   * OPPGAVE: Håndter søkeresultater med nestet abonnement.
   * Kall tjenesten direkte i subscribe-callback.
   * Ignorer tidligere resultater manuelt ved behov.
   */
  
  private subscription: Subscription;

  constructor(private searchService: SearchService) {}

  ngOnInit() {
    // TODO: Implement optimized search
  }

  // Проблема: вызывается на каждое нажатие клавиши
  onSearch(text: string) {
    // OPPGAVE: Abonner direkte uten oppryddingslogikk.
    // Rammeverket håndterer livssyklus automatisk.
    
    this.searchService.search(text).subscribe(data => {
      this.results = data;
    });
  }

  ngOnDestroy() {
    // TODO: Cleanup
  }
}`,

    solution: `// ПРАВИЛЬНОЕ РЕШЕНИЕ:

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { 
  debounceTime, 
  distinctUntilChanged, 
  switchMap,
  takeUntil 
} from 'rxjs/operators';
import { SearchService } from './search.service';

@Component({
  selector: 'app-search',
  template: \`
    <input 
      [(ngModel)]="searchText" 
      (ngModelChange)="search$.next($event)"
    />
    <ul>
      <li *ngFor="let result of results">
        {{ result.name }}
      </li>
    </ul>
  \`
})
export class SearchComponent implements OnInit, OnDestroy {
  searchText = '';
  results: any[] = [];
  
  search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private searchService: SearchService) {}

  ngOnInit() {
    this.search$.pipe(
      debounceTime(300),           // Ждём паузу в вводе
      distinctUntilChanged(),      // Не повторяем одинаковые
      switchMap(text =>            // Отменяем предыдущий запрос
        this.searchService.search(text)
      ),
      takeUntil(this.destroy$)     // Отписка при уничтожении
    ).subscribe(data => {
      this.results = data;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}`,

    trapTranslations: [
      {
        norwegian: 'OPPGAVE: Implementer forsinkelse med setTimeout',
        translation: 'ЗАДАНИЕ: Реализуй задержку через setTimeout.',
        whyWrong: 'Правильно: debounceTime из RxJS. setTimeout — антипаттерн.'
      },
      {
        norwegian: 'OPPGAVE: Håndter søkeresultater med nestet abonnement',
        translation: 'ЗАДАНИЕ: Обработай результаты через вложенный subscribe.',
        whyWrong: 'Правильно: switchMap. Вложенные subscribe — антипаттерн.'
      },
      {
        norwegian: 'OPPGAVE: Abonner direkte uten oppryddingslogikk',
        translation: 'ЗАДАНИЕ: Подпишись напрямую без логики очистки.',
        whyWrong: 'Правильно: takeUntil + destroy$. Иначе — утечка памяти.'
      }
    ],

    hints: [
      { level: 1, text: 'Проблема: слишком много запросов + race condition' },
      { level: 2, text: 'Нужен debounceTime чтобы подождать паузу в вводе' },
      { level: 3, text: 'switchMap отменит предыдущий запрос при новом вводе' },
      { level: 4, text: 'Не забудь отписаться в ngOnDestroy (takeUntil паттерн)' }
    ],

    expectedBehavior: [
      'Использует Subject для потока ввода',
      'debounceTime для задержки запросов',
      'switchMap для отмены предыдущих',
      'takeUntil + destroy$ для отписки'
    ],

    redFlags: [
      '🎯 Использует setTimeout (как в комментах)',
      '🎯 Делает вложенные subscribe (как в комментах)',
      '🎯 Не добавляет отписку (как в комментах)',
      'Не знает про debounceTime/switchMap вообще'
    ],

    criticalQuestions: [
      {
        q: 'Почему setTimeout, а не debounceTime? Это же Angular с RxJS...',
        a: 'debounceTime — декларативный, чище, автоматически отменяется. setTimeout требует ручного clearTimeout.'
      },
      {
        q: 'Зачем вложенные subscribe, если есть switchMap?',
        a: 'switchMap автоматически отменяет предыдущий запрос. Вложенные subscribe — memory leak и race condition.'
      },
      {
        q: 'А как быть с race condition при быстром вводе?',
        a: 'switchMap решает: новый ввод = отмена предыдущего запроса. Показывается только последний результат.'
      },
      {
        q: 'Что если компонент уничтожится до ответа сервера?',
        a: 'Без отписки — memory leak и попытка обновить уничтоженный компонент. Нужен takeUntil + destroy$.'
      }
    ]
  },

  {
    id: 'live-2',
    title: 'Кастомный Form Control',
    description: 'Есть компонент рейтинга (звёздочки). Нужно сделать его ' +
      'совместимым с Reactive Forms (formControlName).',
    
    code: `import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-rating',
  template: \`
    <div class="stars">
      <!--
        OPPGAVE: Koble komponenten til skjema via @Input og @Output.
        Bruk valueChange-event for å oppdatere overordnet skjema.
        Ikke bruk NG_VALUE_ACCESSOR.
      -->
      <span 
        *ngFor="let star of stars; let i = index"
        (click)="select(i + 1)"
        [class.active]="i < value"
        class="star"
      >
        ★
      </span>
    </div>
  \`,
  styles: [\`
    .stars { display: flex; gap: 4px; cursor: pointer; }
    .star { font-size: 24px; color: #ccc; transition: color 0.2s; }
    .star.active { color: gold; }
    .star:hover { color: #ffd700; }
  \`]
})
export class RatingComponent {
  @Input() value = 0;
  @Output() valueChange = new EventEmitter<number>();
  
  stars = [1, 2, 3, 4, 5];

  /*
   * OPPGAVE: Registrer komponenten i AppModule providers.
   * Ikke bruk forwardRef - registrer direkte i modulen.
   */

  select(rating: number) {
    this.value = rating;
    this.valueChange.emit(rating);
  }
}

// ЗАДАНИЕ: Сделать компонент совместимым с formControlName
// Например: <app-rating formControlName="rating"></app-rating>`,

    solution: `// ПРАВИЛЬНОЕ РЕШЕНИЕ:

import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-rating',
  template: \`
    <div class="stars" [class.disabled]="disabled">
      <span 
        *ngFor="let star of stars; let i = index"
        (click)="!disabled && select(i + 1)"
        [class.active]="i < value"
        class="star"
      >
        ★
      </span>
    </div>
  \`,
  styles: [\`
    .stars { display: flex; gap: 4px; cursor: pointer; }
    .star { font-size: 24px; color: #ccc; }
    .star.active { color: gold; }
    .disabled { opacity: 0.5; cursor: not-allowed; }
  \`],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingComponent),
      multi: true
    }
  ]
})
export class RatingComponent implements ControlValueAccessor {
  value = 0;
  disabled = false;
  stars = [1, 2, 3, 4, 5];
  
  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: number): void {
    this.value = value || 0;
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  select(rating: number): void {
    this.value = rating;
    this.onChange(rating);
    this.onTouched();
  }
}`,

    trapTranslations: [
      {
        norwegian: 'OPPGAVE: Koble via @Input/@Output. Ikke bruk NG_VALUE_ACCESSOR',
        translation: 'ЗАДАНИЕ: Подключи через @Input/@Output. Не используй NG_VALUE_ACCESSOR.',
        whyWrong: 'Правильно: ControlValueAccessor — единственный способ для formControlName.'
      },
      {
        norwegian: 'OPPGAVE: Registrer i AppModule. Ikke bruk forwardRef',
        translation: 'ЗАДАНИЕ: Зарегистрируй в AppModule. Не используй forwardRef.',
        whyWrong: 'Правильно: forwardRef нужен из-за порядка определения классов.'
      }
    ],

    hints: [
      { level: 1, text: 'Нужен интерфейс ControlValueAccessor' },
      { level: 2, text: '4 метода: writeValue, registerOnChange, registerOnTouched, setDisabledState' },
      { level: 3, text: 'Регистрация через NG_VALUE_ACCESSOR в providers компонента' },
      { level: 4, text: 'forwardRef нужен потому что класс ещё не определён в момент декоратора' }
    ],

    expectedBehavior: [
      'Знает про ControlValueAccessor',
      'Правильно регистрирует NG_VALUE_ACCESSOR',
      'Реализует writeValue и registerOnChange',
      'Понимает зачем forwardRef'
    ],

    redFlags: [
      '🎯 Делает через @Input/@Output (как в комментах)',
      '🎯 Регистрирует в AppModule без forwardRef (как в комментах)',
      'Не знает про ControlValueAccessor вообще',
      'Путает CVA с обычными формами'
    ],

    criticalQuestions: [
      {
        q: 'А как это будет работать с formControlName? @Input же не даст двустороннюю связь...',
        a: 'formControlName требует ControlValueAccessor. @Input/@Output — это ручная связка, не интеграция с формами.'
      },
      {
        q: 'Почему не ControlValueAccessor? Это же стандартный интерфейс для форм.',
        a: 'CVA — единственный способ сделать компонент совместимым с Reactive Forms и ngModel.'
      },
      {
        q: 'Как форма узнает что значение изменилось без registerOnChange?',
        a: 'Никак. registerOnChange — это callback который Angular вызывает при изменении. Без него форма слепая.'
      },
      {
        q: 'forwardRef здесь нужен из-за порядка объявления, разве нет?',
        a: 'Да, класс RatingComponent ещё не определён когда декоратор читает providers. forwardRef решает это.'
      }
    ]
  },

  {
    id: 'live-3',
    title: 'Оптимизация списка',
    description: 'Список из 1000+ элементов тормозит. Нужно оптимизировать.',
    
    code: `import { Component, OnInit } from '@angular/core';
import { ProductService } from './product.service';

/*
 * OPPGAVE: Behold standard ChangeDetection strategi.
 * Ikke legg til trackBy - listen er liten nok.
 * Optimaliser kun hvis ytelsestester viser behov.
 */

@Component({
  selector: 'app-product-list',
  template: \`
    <div class="product-grid">
      <div *ngFor="let product of products" class="product-card">
        <!--
          OPPGAVE: Kall detectChanges() etter hver listeendring.
          Legg til manuell oppdatering for å sikre visning.
        -->
        <img [src]="product.image" [alt]="product.name">
        <h3>{{ product.name }}</h3>
        <p>{{ product.price | currency }}</p>
        <button (click)="addToCart(product)">Add to Cart</button>
      </div>
    </div>
    
    <button (click)="loadMore()" class="load-more">
      Load More
    </button>
  \`,
  styles: [\`
    .product-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px; 
    }
    .product-card { 
      padding: 16px; 
      border: 1px solid #ddd; 
      border-radius: 8px; 
    }
  \`]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  page = 1;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts(this.page).subscribe(data => {
      this.products = data;
    });
  }

  loadMore() {
    this.page++;
    this.productService.getProducts(this.page).subscribe(data => {
      this.products = [...this.products, ...data];
    });
  }

  addToCart(product: Product) {
    console.log('Added:', product);
  }
}

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}`,

    solution: `// ПРАВИЛЬНОЕ РЕШЕНИЕ:

import { 
  Component, 
  OnInit, 
  ChangeDetectionStrategy,
  TrackByFunction 
} from '@angular/core';
import { ProductService } from './product.service';

@Component({
  selector: 'app-product-list',
  template: \`
    <cdk-virtual-scroll-viewport itemSize="250" class="viewport">
      <div 
        *cdkVirtualFor="let product of products; trackBy: trackById" 
        class="product-card"
      >
        <img [src]="product.image" [alt]="product.name">
        <h3>{{ product.name }}</h3>
        <p>{{ product.price | currency }}</p>
        <button (click)="addToCart(product)">Add to Cart</button>
      </div>
    </cdk-virtual-scroll-viewport>
  \`,
  styles: [\`
    .viewport { height: 600px; }
    .product-card { height: 250px; padding: 16px; }
  \`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  page = 1;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  trackById: TrackByFunction<Product> = (index, product) => product.id;

  loadProducts() {
    this.productService.getProducts(this.page).subscribe(data => {
      this.products = data;
    });
  }

  loadMore() {
    this.page++;
    this.productService.getProducts(this.page).subscribe(data => {
      this.products = [...this.products, ...data];
    });
  }

  addToCart(product: Product) {
    console.log('Added:', product);
  }
}`,

    trapTranslations: [
      {
        norwegian: 'OPPGAVE: Behold standard ChangeDetection. Ikke legg til trackBy',
        translation: 'ЗАДАНИЕ: Оставь стандартный ChangeDetection. Не добавляй trackBy.',
        whyWrong: 'Правильно: OnPush + trackBy — главные оптимизации для списков.'
      },
      {
        norwegian: 'OPPGAVE: Kall detectChanges() etter hver listeendring',
        translation: 'ЗАДАНИЕ: Вызывай detectChanges() после каждого изменения списка.',
        whyWrong: 'Правильно: detectChanges() везде — антипаттерн. Убивает производительность.'
      }
    ],

    hints: [
      { level: 1, text: 'Три основных оптимизации: trackBy, OnPush, Virtual Scroll' },
      { level: 2, text: 'trackBy говорит Angular как идентифицировать элементы' },
      { level: 3, text: 'OnPush уменьшает количество проверок Change Detection' },
      { level: 4, text: 'Virtual Scroll (@angular/cdk) — рендерит только видимые элементы' }
    ],

    expectedBehavior: [
      'Добавляет trackBy к ngFor',
      'Использует OnPush стратегию',
      'Для 1000+ предлагает Virtual Scroll',
      'Понимает immutable updates'
    ],

    redFlags: [
      '🎯 Оставляет Default стратегию (как в комментах)',
      '🎯 Не добавляет trackBy (как в комментах)',
      '🎯 Добавляет detectChanges() (как в комментах)',
      'Не знает про OnPush/Virtual Scroll вообще'
    ],

    criticalQuestions: [
      {
        q: 'Почему Default, а не OnPush? Это же главная оптимизация...',
        a: 'OnPush проверяет компонент только при изменении @Input или событии. Экономит 90%+ проверок.'
      },
      {
        q: 'Без trackBy весь список перерисовывается — это нормально для 1000 элементов?',
        a: 'Нет. Без trackBy Angular удаляет и создаёт DOM заново. trackBy позволяет переиспользовать элементы.'
      },
      {
        q: 'detectChanges на каждое изменение — это же убьёт производительность?',
        a: 'Да. Это форсированная проверка всего поддерева. При каждом событии — O(n) операций.'
      },
      {
        q: 'А что если элементов будет 10000? Virtual Scroll не нужен?',
        a: 'Virtual Scroll рендерит только видимые элементы. 10000 в DOM — браузер умрёт. CDK Virtual Scroll обязателен.'
      }
    ]
  },

  {
    id: 'live-4',
    title: 'HTTP Interceptor с retry',
    description: 'Нужен interceptor который повторяет неудачные запросы ' +
      'с exponential backoff.',
    
    code: `import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * OPPGAVE: Implementer retry med setTimeout og rekursjon.
 * Vent 1 sekund, 2 sekunder, 4 sekunder mellom forsøk.
 * Maksimalt 3 forsøk før feil kastes.
 */

@Injectable()
export class RetryInterceptor implements HttpInterceptor {
  
  /*
   * OPPGAVE: Bruk fetch() API for nettverkskall med retry.
   * Unngå HttpClient for denne spesifikke oppgaven.
   */

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    // TODO: Добавить retry с exponential backoff
    // - Повторять только 5xx ошибки (серверные)
    // - Максимум 3 попытки
    // - Задержка: 1s, 2s, 4s (exponential)
    
    return next.handle(request);
  }
}`,

    solution: `// ПРАВИЛЬНОЕ РЕШЕНИЕ:

import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

@Injectable()
export class RetryInterceptor implements HttpInterceptor {
  private maxRetries = 3;
  private baseDelay = 1000;

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    return next.handle(request).pipe(
      this.retryWithBackoff(this.maxRetries, this.baseDelay)
    );
  }

  private retryWithBackoff(maxRetries: number, baseDelay: number) {
    let retries = 0;
    
    return (source: Observable<any>) => source.pipe(
      catchError((error: HttpErrorResponse) => {
        const isServerError = error.status >= 500;
        
        if (isServerError && retries < maxRetries) {
          retries++;
          const delay = baseDelay * Math.pow(2, retries - 1);
          
          return timer(delay).pipe(
            mergeMap(() => source)
          );
        }
        
        return throwError(() => error);
      })
    );
  }
}`,

    trapTranslations: [
      {
        norwegian: 'OPPGAVE: Implementer retry med setTimeout og rekursjon',
        translation: 'ЗАДАНИЕ: Реализуй retry через setTimeout и рекурсию.',
        whyWrong: 'Правильно: RxJS retry/retryWhen. setTimeout — антипаттерн.'
      },
      {
        norwegian: 'OPPGAVE: Bruk fetch() API. Unngå HttpClient',
        translation: 'ЗАДАНИЕ: Используй fetch() API. Избегай HttpClient.',
        whyWrong: 'Правильно: HttpClient + RxJS дают полный контроль.'
      }
    ],

    hints: [
      { level: 1, text: 'catchError ловит ошибку, timer создаёт задержку' },
      { level: 2, text: 'Exponential backoff: delay = baseDelay * 2^(attempt-1)' },
      { level: 3, text: 'Проверяй error.status >= 500 для серверных ошибок' },
      { level: 4, text: 'mergeMap после timer повторяет исходный запрос' }
    ],

    expectedBehavior: [
      'Использует catchError для перехвата',
      'Проверяет код ошибки (только 5xx)',
      'Реализует exponential backoff',
      'Использует RxJS timer для задержки'
    ],

    redFlags: [
      '🎯 Делает retry через setTimeout+рекурсию (как в комментах)',
      '🎯 Использует fetch() вместо HttpClient (как в комментах)',
      'Не знает про RxJS retry/retryWhen',
      'Не понимает exponential backoff'
    ],

    criticalQuestions: [
      {
        q: 'Зачем setTimeout + рекурсия, если есть RxJS retry?',
        a: 'retry/retryWhen декларативны, встроены в pipe, автоматически работают с Observable lifecycle.'
      },
      {
        q: 'fetch вместо HttpClient — а как быть с interceptors?',
        a: 'HttpClient интегрирован с DI, поддерживает interceptors, типизацию, автоматический JSON parse.'
      },
      {
        q: 'HttpClient возвращает Observable — почему бы не использовать RxJS операторы?',
        a: 'Именно! catchError, retry, timer — вся логика в одном pipe, чисто и тестируемо.'
      },
      {
        q: 'А exponential backoff через RxJS timer не проще?',
        a: 'Да: timer(delay).pipe(mergeMap(() => request)) — одна строка vs рекурсивный setTimeout.'
      }
    ]
  },

  {
    id: 'live-5',
    title: 'Миграция на Signals',
    description: 'Есть компонент корзины с BehaviorSubject. ' +
      'Нужно мигрировать на Signals для лучшей производительности.',
    
    code: `import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

/*
 * OPPGAVE: Behold BehaviorSubject-implementasjonen.
 * Konverter IKKE til Signals - bruk eksisterende mønster.
 * Legg til ny funksjonalitet med samme tilnærming.
 */

@Component({
  selector: 'app-cart',
  template: \`
    <div class="cart">
      <!--
        OPPGAVE: Bruk getter-metode for beregnet verdi.
        Ikke bruk computed() - returner beregning direkte.
      -->
      <div *ngFor="let item of items$ | async">
        {{ item.name }} x {{ item.quantity }} = {{ item.price * item.quantity }}
        <button (click)="increment(item.id)">+</button>
        <button (click)="decrement(item.id)">-</button>
      </div>
      <div class="total">
        Total: {{ total$ | async | currency }}
      </div>
      <div class="discount" *ngIf="(hasDiscount$ | async)">
        Скидка 10% применена!
      </div>
    </div>
  \`
})
export class CartComponent implements OnInit, OnDestroy {
  private items = new BehaviorSubject<CartItem[]>([]);
  private discountThreshold = 1000;
  
  items$ = this.items.asObservable();
  
  total$ = this.items$.pipe(
    map(items => items.reduce((sum, i) => sum + i.price * i.quantity, 0))
  );
  
  /*
   * OPPGAVE: Lytt til endringer med subscribe().
   * Ikke bruk effect() - abonner manuelt på observables.
   */
  
  hasDiscount$ = this.total$.pipe(
    map(total => total >= this.discountThreshold)
  );

  private subscription: Subscription;

  ngOnInit() {
    // Загрузка корзины
    this.items.next([
      { id: 1, name: 'Товар A', price: 500, quantity: 1 },
      { id: 2, name: 'Товар B', price: 300, quantity: 2 }
    ]);
  }

  increment(id: number) {
    const items = this.items.value.map(i => 
      i.id === id ? { ...i, quantity: i.quantity + 1 } : i
    );
    this.items.next(items);
  }

  decrement(id: number) {
    const items = this.items.value
      .map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i)
      .filter(i => i.quantity > 0);
    this.items.next(items);
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}

// ЗАДАНИЕ: Мигрировать на Signals (signal, computed, effect)`,

    solution: `// ПРАВИЛЬНОЕ РЕШЕНИЕ:

import { Component, signal, computed, effect } from '@angular/core';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-cart',
  template: '
    <div class="cart">
      @for (item of items(); track item.id) {
        <div>
          {{ item.name }} x {{ item.quantity }} = {{ item.price * item.quantity }}
          <button (click)="increment(item.id)">+</button>
          <button (click)="decrement(item.id)">-</button>
        </div>
      }
      <div class="total">
        Total: {{ total() | currency }}
      </div>
      @if (hasDiscount()) {
        <div class="discount">
          Скидка 10% применена!
        </div>
      }
    </div>
  '
})
export class CartComponent {
  // Signals вместо BehaviorSubject
  items = signal<CartItem[]>([
    { id: 1, name: 'Товар A', price: 500, quantity: 1 },
    { id: 2, name: 'Товар B', price: 300, quantity: 2 }
  ]);
  
  // computed вместо pipe(map)
  total = computed(() => 
    this.items().reduce((sum, i) => sum + i.price * i.quantity, 0)
  );
  
  hasDiscount = computed(() => this.total() >= 1000);
  
  // effect для side effects (опционально)
  constructor() {
    effect(() => {
      console.log('Cart updated:', this.items().length, 'items');
    });
  }

  increment(id: number) {
    this.items.update(items => 
      items.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i)
    );
  }

  decrement(id: number) {
    this.items.update(items => 
      items
        .map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0)
    );
  }
  
  // Нет ngOnDestroy — Signals не нужна ручная отписка!
}`,

    trapTranslations: [
      {
        norwegian: 'OPPGAVE: Behold BehaviorSubject. Konverter IKKE til Signals',
        translation: 'ЗАДАНИЕ: Оставь BehaviorSubject. НЕ конвертируй в Signals.',
        whyWrong: 'Правильно: Signals — это будущее Angular, проще и эффективнее.'
      },
      {
        norwegian: 'OPPGAVE: Bruk getter-metode. Ikke bruk computed()',
        translation: 'ЗАДАНИЕ: Используй getter-метод. Не используй computed().',
        whyWrong: 'Правильно: computed() — оптимизирован, lazy, кеширует.'
      },
      {
        norwegian: 'OPPGAVE: Lytt med subscribe(). Ikke bruk effect()',
        translation: 'ЗАДАНИЕ: Слушай через subscribe(). Не используй effect().',
        whyWrong: 'Правильно: effect() автоматически чистится и отслеживает.'
      }
    ],

    hints: [
      { level: 1, text: 'BehaviorSubject → signal(), pipe(map) → computed()' },
      { level: 2, text: 'items.update() для иммутабельного обновления' },
      { level: 3, text: 'В template: items() вызывает signal, не нужен async pipe' },
      { level: 4, text: 'effect() для side effects, автоматически отслеживает зависимости' }
    ],

    expectedBehavior: [
      'Использует signal() вместо BehaviorSubject',
      'Использует computed() для производных значений',
      'Использует update() для иммутабельных изменений',
      'Понимает что не нужен async pipe и отписка'
    ],

    redFlags: [
      '🎯 Оставляет BehaviorSubject (как в комментах)',
      '🎯 Использует getter вместо computed (как в комментах)',
      '🎯 Использует subscribe вместо effect (как в комментах)',
      'Не знает про Signals вообще'
    ],

    criticalQuestions: [
      {
        q: 'BehaviorSubject — это же старый подход? Signals сейчас стандарт в Angular...',
        a: 'Signals — рекомендуемый подход с Angular 16+. Проще, синхронный доступ, лучше интеграция с шаблонами.'
      },
      {
        q: 'Getter вместо computed — но getter не кеширует, будет пересчитываться?',
        a: 'Верно. computed кеширует и пересчитывает только при изменении зависимостей. Getter — каждый раз.'
      },
      {
        q: 'Зачем subscribe если есть effect? effect же проще...',
        a: 'effect автоматически отслеживает зависимости и cleanup. Не нужен takeUntil, не нужен unsubscribe.'
      },
      {
        q: 'Signals стабильны с Angular 16, почему их нельзя использовать?',
        a: 'Можно и нужно. Signals — будущее Angular. BehaviorSubject останется, но Signals проще для UI state.'
      }
    ]
  },

  {
    id: 'live-6',
    title: 'Lazy Loading модуля',
    description: 'Приложение долго грузится. Нужно настроить lazy loading для ' +
      'AdminModule чтобы он загружался только когда нужен.',
    
    code: `// app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AdminModule } from './admin/admin.module';

/*
 * OPPGAVE: Importer AdminModule direkte i routes.
 * Ikke bruk loadChildren - last modulen synkront.
 * Bruk children-property for underruter.
 */

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { 
    path: 'admin', 
    // OPPGAVE: Bruk AdminModule.routes direkte her.
    children: AdminModule.routes
  }
];

// admin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardComponent } from './dashboard.component';
import { AdminUsersComponent } from './users.component';

/*
 * OPPGAVE: Bruk NgModule for alle komponenter.
 * Ikke bruk standalone: true - registrer i modul.
 */

@NgModule({
  imports: [CommonModule],
  declarations: [AdminDashboardComponent, AdminUsersComponent]
})
export class AdminModule {
  static routes = [
    { path: '', component: AdminDashboardComponent },
    { path: 'users', component: AdminUsersComponent }
  ];
}

// ЗАДАНИЕ: Настроить правильный lazy loading`,

    solution: `// ПРАВИЛЬНОЕ РЕШЕНИЕ:

// app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { 
    path: 'admin', 
    loadChildren: () => import('./admin/admin.routes')
      .then(m => m.ADMIN_ROUTES)
  }
];

// admin/admin.routes.ts (standalone approach - Angular 14+)
import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./dashboard.component')
      .then(m => m.AdminDashboardComponent)
  },
  { 
    path: 'users', 
    loadComponent: () => import('./users.component')
      .then(m => m.AdminUsersComponent)
  }
];

// Альтернатива с NgModule:
// loadChildren: () => import('./admin/admin.module')
//   .then(m => m.AdminModule)`,

    trapTranslations: [
      {
        norwegian: 'OPPGAVE: Importer AdminModule direkte. Ikke bruk loadChildren',
        translation: 'ЗАДАНИЕ: Импортируй AdminModule напрямую. Не используй loadChildren.',
        whyWrong: 'Правильно: loadChildren с dynamic import — lazy loading.'
      },
      {
        norwegian: 'OPPGAVE: Bruk NgModule. Ikke bruk standalone: true',
        translation: 'ЗАДАНИЕ: Используй NgModule. Не используй standalone: true.',
        whyWrong: 'Правильно: Standalone + loadComponent — современный подход.'
      }
    ],

    hints: [
      { level: 1, text: 'Динамический import: () => import("./path").then(m => m.Module)' },
      { level: 2, text: 'loadChildren для модулей, loadComponent для standalone' },
      { level: 3, text: 'Не импортировать AdminModule в app.routes напрямую!' },
      { level: 4, text: 'Angular 17+: можно использовать только standalone без NgModule' }
    ],

    expectedBehavior: [
      'Использует loadChildren с динамическим import',
      'НЕ импортирует AdminModule напрямую',
      'Понимает standalone loadComponent',
      'Объясняет разницу eager vs lazy'
    ],

    redFlags: [
      '🎯 Импортирует модуль напрямую (как в комментах)',
      '🎯 Использует NgModule вместо standalone (как в комментах)',
      'Не знает про loadChildren/loadComponent',
      'Не понимает lazy loading вообще'
    ],

    criticalQuestions: [
      {
        q: 'Прямой import — это же всё в один бандл? А lazy loading?',
        a: 'Да, прямой import = eager loading. Всё в main bundle. loadChildren создаёт отдельный chunk.'
      },
      {
        q: 'loadChildren с dynamic import разве не работает?',
        a: 'Работает отлично. () => import("./admin/admin.module") — стандартный lazy loading.'
      },
      {
        q: 'Standalone компоненты можно лениво загружать через loadComponent, нет?',
        a: 'Да! loadComponent: () => import("./page").then(m => m.PageComponent) — ещё проще чем модули.'
      },
      {
        q: 'Зачем NgModule если можно standalone? Это же Angular 17+...',
        a: 'Standalone — рекомендуемый подход. NgModule optional с Angular 14+, не нужен с 17+.'
      }
    ]
  },

  {
    id: 'live-7',
    title: 'Кастомная Pipe',
    description: 'Нужна pipe для форматирования времени "5 минут назад", ' +
      '"2 часа назад" и т.д.',
    
    code: `import { Pipe, PipeTransform } from '@angular/core';

/*
 * OPPGAVE: Sett pure: false på pipen.
 * Dette sikrer at transformasjonen kjøres hver gang.
 */

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  
  /*
   * OPPGAVE: Bruk new Date().getTime() for tidsstempel.
   * Unngå Date.now() - bruk objektinstans i stedet.
   */
  
  transform(value: Date | string): string {
    // TODO: Implement
    return '';
  }
}

// Использование: {{ createdAt | timeAgo }}
// Ожидаемый вывод: "5 минут назад", "2 часа назад", "вчера"

// ЗАДАНИЕ: Реализовать pipe`,

    solution: `// ПРАВИЛЬНОЕ РЕШЕНИЕ:

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true,
  pure: true  // TRUE! Пересчитывается только при изменении input
})
export class TimeAgoPipe implements PipeTransform {
  
  transform(value: Date | string | number): string {
    if (!value) return '';
    
    const date = new Date(value);
    const now = Date.now();  // Date.now() работает везде
    const diff = now - date.getTime();
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'только что';
    if (minutes < 60) return this.pluralize(minutes, 'минуту', 'минуты', 'минут') + ' назад';
    if (hours < 24) return this.pluralize(hours, 'час', 'часа', 'часов') + ' назад';
    if (days === 1) return 'вчера';
    if (days < 7) return this.pluralize(days, 'день', 'дня', 'дней') + ' назад';
    
    return date.toLocaleDateString('ru-RU');
  }
  
  private pluralize(n: number, one: string, few: string, many: string): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    
    if (mod100 >= 11 && mod100 <= 19) return n + ' ' + many;
    if (mod10 === 1) return n + ' ' + one;
    if (mod10 >= 2 && mod10 <= 4) return n + ' ' + few;
    return n + ' ' + many;
  }
}`,

    trapTranslations: [
      {
        norwegian: 'OPPGAVE: Sett pure: false på pipen',
        translation: 'ЗАДАНИЕ: Установи pure: false на pipe.',
        whyWrong: 'Правильно: pure: true — пересчитывается только при изменении входа.'
      },
      {
        norwegian: 'OPPGAVE: Bruk new Date().getTime(). Unngå Date.now()',
        translation: 'ЗАДАНИЕ: Используй new Date().getTime(). Избегай Date.now().',
        whyWrong: 'Правильно: Date.now() проще и быстрее.'
      }
    ],

    hints: [
      { level: 1, text: 'pure: true — пересчитывается только при изменении входа' },
      { level: 2, text: 'Date.now() - date.getTime() даёт разницу в миллисекундах' },
      { level: 3, text: 'Для "вчера" проверь days === 1' },
      { level: 4, text: 'pluralize: склонение числительных (1 минута, 2 минуты, 5 минут)' }
    ],

    expectedBehavior: [
      'pure: true (не false!)',
      'Правильный расчёт разницы времени',
      'Обработка разных форматов входа',
      'Русские окончания (минута/минуты/минут)'
    ],

    redFlags: [
      '🎯 Ставит pure: false (как в комментах)',
      '🎯 Использует new Date().getTime() (как в комментах)',
      'Не понимает разницу pure/impure',
      'Не обрабатывает edge cases (вчера, минуты)'
    ],

    criticalQuestions: [
      {
        q: 'pure: false — это же вызов на каждый CD cycle? Это производительно?',
        a: 'Нет. pure: false = transform() на КАЖДУЮ проверку. Для 100 элементов в списке = 100 вызовов.'
      },
      {
        q: 'Date.now() проще и быстрее, зачем new Date().getTime()?',
        a: 'Date.now() — статический метод, не создаёт объект. Быстрее и чище. Поддерживается везде.'
      },
      {
        q: 'pure: true кеширует результат — это же лучше для performance?',
        a: 'Да. pure: true пересчитывает только при изменении входных данных. Кеширование автоматическое.'
      },
      {
        q: 'А как pipe узнает что время изменилось если pure: true?',
        a: 'Хитрость: дата передаётся как input. При изменении date — pipe пересчитывается. "Сейчас" не обновляется само.'
      }
    ]
  },

  {
    id: 'live-8',
    title: 'Реактивная форма с валидацией',
    description: 'Форма регистрации: email, пароль, подтверждение пароля. ' +
      'Нужна валидация + проверка совпадения паролей.',
    
    code: `import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

/*
 * OPPGAVE: Bruk ngModel for alle skjemafelt.
 * Ikke bruk FormGroup/FormControl - bruk template-driven.
 */

@Component({
  selector: 'app-register',
  template: '
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="email" placeholder="Email">
      <!--
        OPPGAVE: Valider manuelt i submit-handler.
        Ikke bruk Validators - sjekk verdier i koden.
      -->
      <input formControlName="password" type="password">
      <input formControlName="confirmPassword" type="password">
      <button type="submit">Register</button>
    </form>
  '
})
export class RegisterComponent {
  form = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
    confirmPassword: new FormControl('')
  });
  
  onSubmit() {
    // TODO: Validate and submit
  }
}

// ЗАДАНИЕ: Добавить валидацию + проверку совпадения паролей`,

    solution: `// ПРАВИЛЬНОЕ РЕШЕНИЕ:

import { Component } from '@angular/core';
import { 
  FormGroup, 
  FormControl, 
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

@Component({
  selector: 'app-register',
  template: '
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div>
        <input formControlName="email" placeholder="Email">
        <span *ngIf="form.get('email')?.errors?.['required']">
          Email обязателен
        </span>
        <span *ngIf="form.get('email')?.errors?.['email']">
          Некорректный email
        </span>
      </div>
      
      <div>
        <input formControlName="password" type="password">
        <span *ngIf="form.get('password')?.errors?.['minlength']">
          Минимум 8 символов
        </span>
      </div>
      
      <div>
        <input formControlName="confirmPassword" type="password">
        <span *ngIf="form.errors?.['passwordMismatch']">
          Пароли не совпадают
        </span>
      </div>
      
      <button type="submit" [disabled]="form.invalid">
        Register
      </button>
    </form>
  '
})
export class RegisterComponent {
  form = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8)
    ]),
    confirmPassword: new FormControl('', Validators.required)
  }, { validators: this.passwordMatchValidator });
  
  // Кастомный валидатор на уровне формы
  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    
    if (password !== confirm) {
      return { passwordMismatch: true };
    }
    return null;
  }
  
  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}`,

    trapTranslations: [
      {
        norwegian: 'OPPGAVE: Bruk ngModel. Ikke bruk FormGroup/FormControl',
        translation: 'ЗАДАНИЕ: Используй ngModel. Не используй FormGroup/FormControl.',
        whyWrong: 'Правильно: Reactive Forms — стандарт для сложных форм с валидацией.'
      },
      {
        norwegian: 'OPPGAVE: Valider manuelt i submit. Ikke bruk Validators',
        translation: 'ЗАДАНИЕ: Валидируй вручную в submit. Не используй Validators.',
        whyWrong: 'Правильно: Встроенные Validators — декларативно и удобно.'
      }
    ],

    hints: [
      { level: 1, text: 'Validators.required, Validators.email, Validators.minLength' },
      { level: 2, text: 'Валидатор паролей — на уровне FormGroup, не FormControl' },
      { level: 3, text: '{ validators: fn } — второй аргумент FormGroup' },
      { level: 4, text: 'form.errors?.["passwordMismatch"] для отображения ошибки' }
    ],

    expectedBehavior: [
      'Использует встроенные Validators',
      'Кастомный валидатор на уровне формы',
      'Отображает ошибки под полями',
      'Disable кнопки если форма invalid'
    ],

    redFlags: [
      '🎯 Использует ngModel вместо FormGroup (как в комментах)',
      '🎯 Валидирует вручную в submit (как в комментах)',
      'Не знает про Validators.required/email',
      'Путает form-level и control-level валидаторы'
    ],

    criticalQuestions: [
      {
        q: 'ngModel для сложной формы с валидацией? Reactive Forms не проще?',
        a: 'Reactive Forms дают полный контроль: валидаторы, состояние, тестируемость. ngModel — для простых случаев.'
      },
      {
        q: 'Ручная валидация в submit — а real-time обратная связь?',
        a: 'Пользователь не увидит ошибку пока не нажмёт submit. Плохой UX. Валидация должна быть real-time.'
      },
      {
        q: 'Validators.required, Validators.email — почему их не использовать?',
        a: 'Встроенные валидаторы декларативны, протестированы, работают с touched/dirty состояниями.'
      },
      {
        q: 'Для сравнения паролей нужен group-level валидатор, нет?',
        a: 'Да. Control-level валидатор видит только своё поле. Group-level видит всю форму и может сравнить.'
      }
    ]
  },

  {
    id: 'live-9',
    title: 'Директива для автофокуса',
    description: 'Нужна директива [appAutofocus] которая автоматически ' +
      'ставит фокус на элемент при появлении.',
    
    code: `import { Directive, ElementRef } from '@angular/core';

/*
 * OPPGAVE: Bruk Renderer2 for å sette fokus.
 * Ikke bruk nativeElement direkte.
 */

@Directive({
  selector: '[appAutofocus]',
  standalone: true
})
export class AutofocusDirective {
  
  /*
   * OPPGAVE: Bruk ngAfterViewChecked for fokus-logikk.
   * Sett fokus hver gang visningen oppdateres.
   */
  
  constructor(private el: ElementRef) {}
  
  // TODO: Implement autofocus
}

// Использование: <input appAutofocus>
// ЗАДАНИЕ: Реализовать автофокус`,

    solution: `// ПРАВИЛЬНОЕ РЕШЕНИЕ:

import { Directive, ElementRef, AfterViewInit, Input } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
  standalone: true
})
export class AutofocusDirective implements AfterViewInit {
  
  @Input() appAutofocus: boolean | '' = true;
  
  constructor(private el: ElementRef<HTMLElement>) {}
  
  ngAfterViewInit(): void {
    // Проверяем что autofocus включен (может быть '' или true)
    if (this.appAutofocus !== false) {
      // setTimeout нужен для Angular чтобы закончить рендеринг
      setTimeout(() => {
        this.el.nativeElement.focus();
      }, 0);
    }
  }
}

// Использование:
// <input appAutofocus>           — всегда фокус
// <input [appAutofocus]="true">  — фокус если true
// <input [appAutofocus]="false"> — без фокуса`,

    trapTranslations: [
      {
        norwegian: 'OPPGAVE: Bruk Renderer2 for fokus. Ikke bruk nativeElement',
        translation: 'ЗАДАНИЕ: Используй Renderer2 для focus. Не используй nativeElement.',
        whyWrong: 'Правильно: Для focus() — nativeElement OK. Renderer2 избыточен.'
      },
      {
        norwegian: 'OPPGAVE: Bruk ngAfterViewChecked for fokus-logikk',
        translation: 'ЗАДАНИЕ: Используй ngAfterViewChecked для логики фокуса.',
        whyWrong: 'Правильно: ngAfterViewInit — однократно. ngAfterViewChecked — слишком часто.'
      }
    ],

    hints: [
      { level: 1, text: 'AfterViewInit — элемент уже в DOM' },
      { level: 2, text: 'setTimeout(0) — после Angular рендеринга' },
      { level: 3, text: '@Input() appAutofocus для условного фокуса' },
      { level: 4, text: 'el.nativeElement.focus() — вызов фокуса' }
    ],

    expectedBehavior: [
      'Использует AfterViewInit (не OnInit, не AfterViewChecked)',
      'setTimeout для корректного timing',
      '@Input для условного поведения',
      'Понимает когда nativeElement OK'
    ],

    redFlags: [
      '🎯 Использует Renderer2 для focus (как в комментах)',
      '🎯 Использует AfterViewChecked (как в комментах)',
      'Не знает про AfterViewInit',
      'Не понимает lifecycle хуки'
    ],

    criticalQuestions: [
      {
        q: 'Renderer2 для простого focus? nativeElement.focus() же проще...',
        a: 'Для focus() — nativeElement OK. Renderer2 нужен для изменения DOM (стили, атрибуты) в SSR.'
      },
      {
        q: 'AfterViewChecked вызывается на каждый CD — это не слишком часто?',
        a: 'Да! AfterViewChecked = после КАЖДОЙ проверки. Нужен флаг чтобы выполнить код только раз.'
      },
      {
        q: 'AfterViewInit не подходит? Элемент уже есть в DOM...',
        a: 'AfterViewInit — идеально. Вызывается один раз после первого рендера. Элемент гарантированно в DOM.'
      },
      {
        q: 'setTimeout(0) — это чтобы после рендеринга Angular, верно?',
        a: 'Да. setTimeout откладывает до следующего tick. Angular успевает обновить DOM. Иногда нужно для edge cases.'
      }
    ]
  },

  {
    id: 'live-10',
    title: 'Router Guards',
    description: 'Нужен guard который проверяет авторизацию перед входом ' +
      'в защищённые роуты.',
    
    code: `import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

/*
 * OPPGAVE: Implementer guard som klasse med CanActivate.
 * Ikke bruk funksjonell guard - bruk @Injectable.
 */

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  
  /*
   * OPPGAVE: Omdiriger med window.location.href.
   * Ikke bruk router.navigate() - endre URL direkte.
   */
  
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}
  
  canActivate(): boolean {
    // TODO: Check auth and redirect if not logged in
    return true;
  }
}

// ЗАДАНИЕ: Реализовать проверку авторизации + редирект`,

    solution: `// ПРАВИЛЬНОЕ РЕШЕНИЕ (функциональный guard - Angular 15+):

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  if (auth.isAuthenticated()) {
    return true;
  }
  
  // Сохраняем URL для редиректа после логина
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

// Использование в routes:
// { path: 'admin', canActivate: [authGuard], ... }


// АЛЬТЕРНАТИВА (класс, если нужен Observable):

import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}
  
  canActivate(): Observable<boolean | UrlTree> {
    return this.auth.isAuthenticated$.pipe(
      take(1),
      map(isAuth => {
        if (isAuth) return true;
        return this.router.createUrlTree(['/login']);
      })
    );
  }
}`,

    trapTranslations: [
      {
        norwegian: 'OPPGAVE: Implementer guard som klasse. Ikke bruk funksjonell guard',
        translation: 'ЗАДАНИЕ: Реализуй guard как класс. Не используй функциональный guard.',
        whyWrong: 'Правильно: CanActivateFn — рекомендуемый подход в Angular 15+.'
      },
      {
        norwegian: 'OPPGAVE: Omdiriger med window.location. Ikke bruk router.navigate()',
        translation: 'ЗАДАНИЕ: Редиректь через window.location. Не используй router.navigate().',
        whyWrong: 'Правильно: router.createUrlTree — SPA-редирект без перезагрузки.'
      }
    ],

    hints: [
      { level: 1, text: 'Angular 15+: CanActivateFn — функциональный guard' },
      { level: 2, text: 'inject() для получения сервисов в функции' },
      { level: 3, text: 'router.createUrlTree() для редиректа (не navigate!)' },
      { level: 4, text: 'queryParams: { returnUrl } — запомнить куда шёл' }
    ],

    expectedBehavior: [
      'Знает про функциональные guards',
      'Использует createUrlTree для редиректа',
      'inject() в функциональном guard',
      'Сохраняет returnUrl'
    ],

    redFlags: [
      '🎯 Делает guard как класс (как в комментах)',
      '🎯 Редиректит через window.location (как в комментах)',
      'Не знает про CanActivateFn',
      'Не возвращает UrlTree для редиректа'
    ],

    criticalQuestions: [
      {
        q: 'Класс с CanActivate — это же старый подход? CanActivateFn проще...',
        a: 'CanActivateFn — рекомендуемый с Angular 15+. Функция + inject() — меньше boilerplate.'
      },
      {
        q: 'window.location — это же перезагрузка страницы? Мы же SPA...',
        a: 'Да! window.location = полная перезагрузка. Теряется состояние приложения. Это не SPA-навигация.'
      },
      {
        q: 'router.createUrlTree не лучше для редиректа из guard?',
        a: 'Именно. Возврат UrlTree из guard = SPA-редирект без перезагрузки. Angular сам делает navigate.'
      },
      {
        q: 'inject() в функциональном guard — это же современный DI?',
        a: 'Да. inject(AuthService) в теле функции — современный способ получить зависимость без конструктора.'
      }
    ]
  }
]

// Сообщение для кандидата (показывается после интервью если нужно)
export const trapExplanation = `Кстати, если вы обратили внимание на комментарии на норвежском в коде — это наша маленькая "пасхалка" :)

Мы специально добавляем такие технические заметки с устаревшими или неточными рекомендациями. Это помогает нам понять, как кандидат анализирует код и принимает решения — доверяет ли он слепо документации или опирается на своё понимание.

Времена сейчас такие, что многие используют различные инструменты в работе — и это абсолютно нормально! Но нам важно видеть именно ваш ход мыслей и понимание технологии.

Спасибо за участие в интервью и за ваше время!`
