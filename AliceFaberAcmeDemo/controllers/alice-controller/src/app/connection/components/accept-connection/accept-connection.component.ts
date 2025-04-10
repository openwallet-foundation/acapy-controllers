import { Component, OnInit } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  UntypedFormControl,
  AsyncValidatorFn,
  ValidationErrors,
} from "@angular/forms";
import { Router } from "@angular/router";

import { AgentService } from "src/app/services/agent.service";

import {
  map,
  debounceTime,
  distinctUntilChanged,
  filter,
  tap,
} from "rxjs/operators";
import { Observable, timer, BehaviorSubject } from "rxjs";

function debouncedInvitationValidator(): AsyncValidatorFn {
  return (control: UntypedFormControl): Observable<ValidationErrors | null> => {
    return timer(300).pipe(
      map(() => {
        try {
          JSON.parse(control.value);
          return null;
        } catch (error) {
          return { json: error.message };
        }
      })
    );
  };
}

@Component({
  selector: "app-accept-connection",
  templateUrl: "./accept-connection.component.html",
  styleUrls: ["./accept-connection.component.scss"],
})
export class AcceptConnectionComponent implements OnInit {
  form: UntypedFormGroup;

  invitationUrlError$ = new BehaviorSubject<string>(null);

  constructor(
    private agentService: AgentService,
    private fb: UntypedFormBuilder,
    private router: Router
  ) {
    this.form = this.fb.group({
      invitation: [null, Validators.required, debouncedInvitationValidator()],
      invitationUrl: [null, Validators.nullValidator],
    });
  }

  public get invitation(): UntypedFormControl {
    return this.form && (this.form.get("invitation") as UntypedFormControl);
  }

  public get invitationUrl(): UntypedFormControl {
    return this.form && (this.form.get("invitationUrl") as UntypedFormControl);
  }

  ngOnInit() {
    this.invitationUrl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.invitationUrlError$.next(null)),
        filter((value: string) => !!value),
        map((value: string) => {
          try {
            const url = new URL(value);

            // Try to get the 'c_i' parameter first
            let invitationParam = url.searchParams.get("c_i");

            // If 'c_i' is not found, try to get the 'oob' parameter
            if (!invitationParam) {
              invitationParam = url.searchParams.get("oob");
            }

            if (!invitationParam) {
              throw new Error(
                "No valid invitation parameter found in the URL."
              );
            }

            // Decode the Base64-encoded invitation parameter
            this.invitation.setValue(
              JSON.stringify(JSON.parse(atob(invitationParam)), null, 4)
            );
            this.invitation.markAsDirty();
            this.invitation.updateValueAndValidity();
          } catch (error) {
            this.invitationUrlError$.next("Invalid invitation URL");
          }
        })
      )
      .subscribe();
  }

  onSubmit() {
    if (!this.form.valid) {
      return;
    }
    this.agentService
      .receiveInvitation(this.invitation.value)
      .pipe(map(() => this.router.navigateByUrl("/connections")))
      .subscribe();
  }
}
