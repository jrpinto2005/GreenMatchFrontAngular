import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MarketplaceItem, OrderRequest, OrderResponse, ItemRequest, ItemRequestResponse } from '../models/marketplace.model';

import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MarketplaceService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getItems(category?: string, skip?: number, limit?: number): Observable<MarketplaceItem[]> {
        let params = new HttpParams();
        if (category) params = params.set('category', category);
        if (skip) params = params.set('skip', skip);
        if (limit) params = params.set('limit', limit);

        return this.http.get<MarketplaceItem[]>(`${this.apiUrl}/marketplace/items`, { params });
    }

    placeOrder(order: OrderRequest): Observable<OrderResponse> {
        return this.http.post<OrderResponse>(`${this.apiUrl}/marketplace/orders`, order);
    }

    requestItem(request: ItemRequest): Observable<ItemRequestResponse> {
        return this.http.post<ItemRequestResponse>(`${this.apiUrl}/marketplace/requests`, request);
    }
}
