import { IRecipe } from '@/services/recipe-service';
import { create } from 'zustand';

export interface CartItem extends IRecipe {
    quantity: number;
    shopId: string;
}

interface CartState {
    items: CartItem[];
    addItem: (item: IRecipe, shopId: string) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    shopId: string | null;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    shopId: null,
    addItem: (item, shopId) => {
        const { items, shopId: currentShopId } = get();

        // Check if adding item from a different shop
        if (currentShopId && currentShopId !== shopId) {
            // Option 1: Error out
            // Option 2: Clear and add (most common in food apps)
            if (!confirm('Bạn có muốn xóa giỏ hàng hiện tại để đặt món từ cửa hàng mới?')) {
                return;
            }
            set({ items: [{ ...item, quantity: 1, shopId }], shopId });
            return;
        }

        const existingItem = items.find((i) => i._id === item._id);
        if (existingItem) {
            set({
                items: items.map((i) =>
                    i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
                ),
            });
        } else {
            set({ items: [...items, { ...item, quantity: 1, shopId }], shopId });
        }
    },
    removeItem: (id) => {
        const { items } = get();
        const newItems = items.filter((i) => i._id !== id);
        set({
            items: newItems,
            shopId: newItems.length === 0 ? null : get().shopId
        });
    },
    updateQuantity: (id, quantity) => {
        const { items } = get();
        if (quantity === 0) {
            get().removeItem(id);
            return;
        }
        set({
            items: items.map((i) =>
                i._id === id ? { ...i, quantity } : i
            ),
        });
    },
    clearCart: () => set({ items: [], shopId: null }),
    getTotal: () => {
        return get().items.reduce((total, item) => total + (item.costEstimate || 0) * item.quantity, 0);
    },
}));
