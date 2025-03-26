import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AgentStatus } from '../enums/agent-status.enum';

import { Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AgentService {

  constructor(private http: HttpClient) { }

  getStatus(): Observable<AgentStatus> {
    console.log('Getting agent status...');
    return this.http.get<any>('/status')
      .pipe(
        tap(response => console.log('Status response:', response)),
        switchMap(() => of(AgentStatus.Up)),
        catchError(this.handleError<any>('getStatus', AgentStatus.Down))
      );
  }

  getConnections(): Observable<any[]> {
    console.log('Getting connections...');
    return this.http.get<any[]>('/connections')
      .pipe(
        tap(response => console.log('Connections response:', response)),
        switchMap((response: any) => of(response.results)),
        catchError(this.handleError<any[]>('getConnections', []))
      );
  }

  removeConnection(connectionId: string): Observable<any> {
    if (!connectionId) {
      console.error('Must provide a connection ID');
      return of(null); // Return an observable with null if no connection ID is provided
    }

    console.log(`Removing connection with ID: ${connectionId}`);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.delete<any>(`/connections/${connectionId}`, { headers })
      .pipe(
        tap(() => console.log(`Connection with ID ${connectionId} removed successfully`)),
        switchMap(() => of(connectionId)),
        catchError(this.handleError<any>('removeConnection', null))
      );
  }

  createInvitation(): Observable<any> {
    console.log('Creating invitation2.2...');
    const invitationRequest = {
      handshake_protocols: ["https://didcomm.org/didexchange/1.1"],
      use_public_did: false
    };
    return this.http.post<any>('/out-of-band/create-invitation', invitationRequest)
      .pipe(
        tap(response => console.log('Create invitation response:', response)),
        switchMap((response: any) => of(response)),
        catchError(this.handleError<any>('createInvitation', null))
      );
  }

  receiveInvitation(invitation: any): Observable<any> {
    console.log('Receiving invitation...');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<any>('/out-of-band/receive-invitation', invitation, { headers })
      .pipe(
        tap(response => console.log('Receive invitation response:', response)),
        catchError(this.handleError<any>('receiveInvitation', null))
      );
  }

  getCredentials(): Observable<any[]> {
    console.log('Getting credentials...');
    return this.http.get<any[]>('/credentials')
      .pipe(
        tap(response => console.log('Credentials response:', response)),
        switchMap((response: any) => of(response.results)),
        catchError(this.handleError<any[]>('getCredentials', []))
      );
  }

  getProofs(): Observable<any[]> {
    console.log('Getting proofs...');
    return this.http.get<any[]>('/present-proof-2.0/records')
      .pipe(
        tap(response => console.log('Proofs response:', response)),
        switchMap((response: any) => of(response.results)),
        catchError(this.handleError<any[]>('getProofs', []))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // Prevent application from completely erroring out.
      return of(result as T);
    };
  }
}
