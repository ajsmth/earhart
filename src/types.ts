export interface IRouteProps {
  path: string;
  to?: string;
  children: any;
}

export interface IRoute extends IRouteProps {
  index: number;
  redirectTo?: string;
}

export interface IMatch {
  index: number;
  pathname: string;
  score: number;
  route: IRoute | null;
  params: any;
}
