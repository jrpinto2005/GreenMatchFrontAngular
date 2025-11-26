import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceItem, OrderRequest, ItemRequest } from '../models/marketplace.model';
import { BarraInferiorComponent } from '../barra-inferior/barra-inferior.component';

@Component({
    selector: 'app-marketplace',
    standalone: true,
    imports: [CommonModule, FormsModule, BarraInferiorComponent],
    templateUrl: './marketplace.component.html',
    styleUrls: ['./marketplace.component.scss']
})
export class MarketplaceComponent implements OnInit {
    items: MarketplaceItem[] = [];
    filteredItems: MarketplaceItem[] = [];
    selectedCategory: string = 'todos';
    isLoading = false;

    // Mapeo de categorías en español a inglés para el filtrado
    categoryMapping: { [key: string]: string } = {
        'todos': 'all',
        'planta': 'plant',
        'maceta': 'pot',
        'fertilizante': 'fertilizer'
    };

    // Modal states
    showOrderModal = false;
    showRequestModal = false;

    // Order state
    selectedItem: MarketplaceItem | null = null;
    orderQuantity = 1;
    shippingAddress = '';
    paymentMethod: 'cash' | 'transfer' = 'cash';
    orderStatus: 'idle' | 'submitting' | 'success' | 'error' = 'idle';

    // Request state
    requestItemName = '';
    requestDescription = '';
    requestStatus: 'idle' | 'submitting' | 'success' | 'error' = 'idle';

    constructor(private marketplaceService: MarketplaceService) { }

    ngOnInit(): void {
        this.loadItems();
    }

    loadItems() {
        this.isLoading = true;
        this.marketplaceService.getItems().subscribe({
            next: (data) => {
                this.items = data;
                this.filterItems();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading items', err);
                this.isLoading = false;
            }
        });
    }

    filterItems(category?: string) {
        if (category) {
            this.selectedCategory = category;
        }

        // Mapear la categoría en español a inglés para el filtrado
        const englishCategory = this.categoryMapping[this.selectedCategory] || this.selectedCategory;

        if (englishCategory === 'all') {
            this.filteredItems = this.items;
        } else {
            this.filteredItems = this.items.filter(item => item.category === englishCategory);
        }
    }

    getImageUrl(url: string | null | undefined): string {
        const placeholderImage = 'assets/plant-placeholder.jpg';

        if (!url) {
            return placeholderImage;
        }

        // If already an HTTP/HTTPS URL, return as is
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        // Convert gs:// URLs to https://storage.googleapis.com/
        if (url.startsWith('gs://')) {
            const withoutScheme = url.slice(5); // Remove 'gs://'
            const slashIdx = withoutScheme.indexOf('/');
            if (slashIdx === -1) return placeholderImage;

            const bucket = withoutScheme.slice(0, slashIdx);
            const path = withoutScheme.slice(slashIdx + 1);
            return `https://storage.googleapis.com/${bucket}/${path}`;
        }

        return placeholderImage;
    }

    openOrderModal(item: MarketplaceItem) {
        this.selectedItem = item;
        this.orderQuantity = 1;
        this.shippingAddress = '';
        this.paymentMethod = 'cash';
        this.orderStatus = 'idle';
        this.showOrderModal = true;
    }

    closeOrderModal() {
        this.showOrderModal = false;
        this.selectedItem = null;
    }

    submitOrder() {
        if (!this.selectedItem || !this.shippingAddress) return;

        this.orderStatus = 'submitting';
        const order: OrderRequest = {
            user_id: Number(localStorage.getItem('user_id')),
            items: [{ item_id: this.selectedItem.id, quantity: this.orderQuantity }],
            shipping_address: this.shippingAddress,
            payment_method: this.paymentMethod
        };
        // Log payload for debugging
        console.log('Submitting order payload:', order);

        this.marketplaceService.placeOrder(order).subscribe({
            next: () => {
                this.orderStatus = 'success';
                setTimeout(() => this.closeOrderModal(), 2000);
            },
            error: () => {
                this.orderStatus = 'error';
            }
        });
    }

    openRequestModal() {
        this.requestItemName = '';
        this.requestDescription = '';
        this.requestStatus = 'idle';
        this.showRequestModal = true;
    }

    closeRequestModal() {
        this.showRequestModal = false;
    }

    submitRequest() {
        if (!this.requestItemName) return;

        this.requestStatus = 'submitting';
        const request: ItemRequest = {
            user_id: Number(localStorage.getItem('user_id')),
            item_name: this.requestItemName,
            description: this.requestDescription
        };
        // Log payload for debugging
        console.log('Submitting request payload:', JSON.stringify(request));

        this.marketplaceService.requestItem(request).subscribe({
            next: () => {
                this.requestStatus = 'success';
                setTimeout(() => this.closeRequestModal(), 2000);
            },
            error: () => {
                this.requestStatus = 'error';
            }
        });
    }
}
