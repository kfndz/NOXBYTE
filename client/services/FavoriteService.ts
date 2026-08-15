const FAVORITES_KEY = "noxbyte_favorites";
const FAVORITES_EVENT = "favorites-updated";

function notifyFavoritesUpdated() {
  window.dispatchEvent(new Event(FAVORITES_EVENT));
}

export const FavoriteService = {
  getAll(): string[] {
    try {
      const data = localStorage.getItem(FAVORITES_KEY);

      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  isFavorite(productId: string): boolean {
    return this.getAll().includes(productId);
  },

  add(productId: string) {
    const favorites = this.getAll();

    if (!favorites.includes(productId)) {
      localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify([...favorites, productId]),
      );

      notifyFavoritesUpdated();
    }
  },

  remove(productId: string) {
    const favorites = this.getAll().filter(
      (item) => item !== productId,
    );

    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(favorites),
    );

    notifyFavoritesUpdated();
  },

  toggle(productId: string) {
    if (this.isFavorite(productId)) {
      this.remove(productId);

      return false;
    }

    this.add(productId);

    return true;
  },
};