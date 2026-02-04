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

    public addItem(item: string): void {
        const currentList = this.listSubject.value;
        this.listSubject.next([...currentList, item]);
    }

    public resetList(): void {
        this.listSubject.next([]);
    }

    public removeLastItem(): void {
        const currentList = this.listSubject.value;
        if (currentList.length == 0) return;
        this.listSubject.next(currentList.slice(0, -1));
    }

    public getLastItem(): string | null {
        const list = this.getList();
        return list.length ? list[list.length - 1] : null;
    }

    public getList(): string[] {
        return this.listSubject.value;
    }

    public setNextItem(item: string) {
        this.nextItemToAdd = item;
    }

    public getNextItem(): string | null {
        return this.nextItemToAdd;
    }

    public setSelectedView(view: string) {
        this.selectedView = view;
    }

    public getSelectedView() {
        return this.selectedView;
    }

    public resetSelectedView() {
        this.selectedView = "";
    }
}