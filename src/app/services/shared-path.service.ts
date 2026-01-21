import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SharedPathService {
    private listSubject: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
    private nextItemToAdd: string | null = null;
    public selectedView: string = "";

    list$: Observable<string[]> = this.listSubject.asObservable();

    constructor() {}

    addItem(item: string): void {
        const currentList = this.listSubject.value;
        this.listSubject.next([...currentList, item]);
    }

    resetList(): void {
        this.listSubject.next([]);
    }

    removeLastItem(): void {
        const currentList = this.listSubject.value;
        if (currentList.length == 0) return;
        this.listSubject.next(currentList.slice(0, -1));
    }

    getLastItem(): string | null {
        const list = this.getList();
        return list.length ? list[list.length - 1] : null;
    }

    getList(): string[] {
        return this.listSubject.value;
    }

    setNextItem(item: string) {
        this.nextItemToAdd = item;
    }

    getNextItem(): string | null {
        return this.nextItemToAdd;
    }

    setSelectedView(view: string) {
        this.selectedView = view;
    }

    getSelectedView() {
        return this.selectedView;
    }

    resetSelectedView() {
        this.selectedView = "";
    }
}