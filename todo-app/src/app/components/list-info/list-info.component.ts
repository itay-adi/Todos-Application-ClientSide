import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { TodoItem } from 'src/app/core/models/todo-item.model';
import { TodoList } from 'src/app/core/models/todo-list.model';
import { TodoitemsService } from 'src/app/core/services/todoitems.service';
import { TodolistsService } from 'src/app/core/services/todolists.service';

@Component({
  selector: 'app-list-info',
  templateUrl: './list-info.component.html',
  styleUrls: ['./list-info.component.css']
})
export class ListInfoComponent implements OnInit {
  list$!: Observable<TodoList | undefined>;
  items$!: Observable<TodoItem[]>;

  delete: boolean = false;
  toDelete$ = new BehaviorSubject<boolean>(this.delete);

  newItem!: FormGroup;
  
  constructor(private todolistsService: TodolistsService,
              private todoItemsService: TodoitemsService,
              private route: ActivatedRoute, //ActivatedRoute helps to get data from the URL
              private formBuilder: FormBuilder) { }

  async ngOnInit(): Promise<void> {
    let currentListId = this.getCurrentListId();

    this.list$ = this.todolistsService.getTodoListById(currentListId);
    this.items$ = this.todoItemsService.getTodoItemsPerListId(currentListId);

    this.newItem = this.formBuilder.group({
                                  //caption: ["",[Validators.required]]} : first way
                                  caption: new FormControl('',[Validators.required])} //second way
                                  );
  }

  private getCurrentListId(): number{
    return Number(this.route.snapshot.params['id']);
  }

  showDelete(){
    this.delete = !this.delete;
    this.toDelete$.next(this.delete);
  }

  async addItem(caption: string){
    let currentListId = this.getCurrentListId();

    let todo = {
      listId: currentListId,
      caption: caption,
      isCompleted: false
    };

    this.todoItemsService.addItemToTodoList(todo);
    this.list$ = this.todolistsService.getTodoListById(currentListId);
    this.newItem.reset();
  }

  async deleteList(){
    let currentListId = this.getCurrentListId();

    await this.todolistsService.deleteTodoListById(currentListId);
  }

  async changItemCompleteStatus(currentItemId : number | undefined){
    await this.todoItemsService.markTodoItemAs(Number(currentItemId));
  }
}
