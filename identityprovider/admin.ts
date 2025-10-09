import IdentityProviderAdminClient from '@keycloak/keycloak-admin-client';
import { IDPConfig } from '../config/index.js';

export const createIdentityProviderClient = async (): Promise<InstanceType<typeof IdentityProviderAdminClient>> => {
    const idpAdminClient = new IdentityProviderAdminClient({
        baseUrl: IDPConfig.baseUrl ?? '',
        realmName: IDPConfig.masterRealm, // Admin Operations start in master realm
    });

    await idpAdminClient.auth({
        grantType: 'password',  
        clientId: IDPConfig.clientId ?? '',
        clientSecret: IDPConfig.clientSecret ?? '',
        username: IDPConfig.adminUser ?? '',
        password: IDPConfig.adminPassword ?? '',
    });

    return idpAdminClient;
}