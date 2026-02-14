export interface IUseCase<TRequest, TResponse> {
    execute(request: TRequest): Promise<TResponse>;
}
export interface ICommand<TRequest, TResponse> extends IUseCase<TRequest, TResponse> {
}
export interface IQuery<TRequest, TResponse> extends IUseCase<TRequest, TResponse> {
}
