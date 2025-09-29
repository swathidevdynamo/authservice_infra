// types/keycloak.d.ts

export interface Keycloak {
  clients: {
    find(): Promise<Array<{ id?: string; clientId?: string; [key: string]: any }>>;
    create(data: {
      clientId: string;
      secret: string;
      publicClient: boolean;
      protocol: string;
      directAccessGrantsEnabled: boolean;
      serviceAccountsEnabled: boolean;
      authorizationServicesEnabled: boolean;
      standardFlowEnabled: boolean;
      implicitFlowEnabled: boolean;
      redirectUris?: string[];
    }): Promise<any>;
    getServiceAccountUser(params: { id: string }): Promise<{ id?: string; [key: string]: any }>;
  };
  groups: {
    find(): Promise<Array<{ id?: string; name?: string; [key: string]: any }>>;
    create(data: { name: string }): Promise<any>;
    addRealmRoleMappings(params: {
      id: string;
      roles: Array<{ id: string; name: string }>;
    }): Promise<any>;
  };
  roles: {
    find(): Promise<Array<{ id?: string; name?: string; [key: string]: any }>>;
    create(data: { name: string }): Promise<any>;
    findOneByName(params: { name: string }): Promise<{ id?: string; name?: string; [key: string]: any } | undefined>;
  };
  users: {
    addRealmRoleMappings(params: {
      id: string;
      roles: Array<{ id: string; name: string }>;
    }): Promise<any>;
  };
}