import { Injectable } from '@angular/core';
import { Subscription, Observable } from 'rxjs';

@Injectable()
export class HttpRequestController<TRequest, TResponse> {
    private _pendingRequestExecution: Subscription | undefined;
    private _pendingRequestJson: string | undefined;

    startRequest(request: TRequest,
        executeRequestCallback: () => Observable<TResponse>,
        loaderVisibilityChanged: (isVisible: boolean) => void,
        requestSucceeded: (response: TResponse) => void,
        requestFailed: (err: any) => void) {
        const requestJson = JSON.stringify(request);

        if (this.isExecutingRequest(requestJson)) {
            return;
        }

        this.abortPendingRequest();

        if (loaderVisibilityChanged) {
            this.registerShowLoader(loaderVisibilityChanged);
        }

        this._pendingRequestJson = requestJson;
        this._pendingRequestExecution = executeRequestCallback().subscribe(
            data => {
                if (requestSucceeded) {
                    requestSucceeded(data);
                }

                this.completeRequest(loaderVisibilityChanged);
            },
            (err: any) => {
                if (requestFailed) {
                    requestFailed(err);
                }

                this.completeRequest(loaderVisibilityChanged);
            });
    }

    private completeRequest(loaderVisibilityChanged: (isVisible: boolean) => void) {
        this._pendingRequestExecution = undefined;
        this._pendingRequestJson = undefined;

        if (loaderVisibilityChanged) {
            loaderVisibilityChanged(false);
        }
    }

    private isExecutingRequest(requestJson: string): boolean {
        if (this._pendingRequestExecution && this._pendingRequestJson) {
            return this._pendingRequestJson === requestJson;
        } else {
            return false;
        }
    }

    private abortPendingRequest() {
        if (this._pendingRequestExecution) {
            this._pendingRequestExecution.unsubscribe();
            this._pendingRequestExecution = undefined;
            this._pendingRequestJson = undefined;
        }
    }

    private registerShowLoader(loaderVisibilityChanged: (isVisible: boolean) => void) {
        setTimeout(() => {
            if (this._pendingRequestExecution && this._pendingRequestJson) {
                loaderVisibilityChanged(true);
            }
        }, 500);
    }
}
