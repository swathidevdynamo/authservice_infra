import KcAdminClient from '@keycloak/keycloak-admin-client';
import { keycloakConfig } from '../config/index.js';

export const createKeycloakClient = async (): Promise<InstanceType<typeof KcAdminClient>> => {
    const kc = new KcAdminClient({
        baseUrl: keycloakConfig.baseUrl ?? '',
        realmName: keycloakConfig.masterRealm, // Admin Operations start in master realm
    });

    await kc.auth({
        grantType: 'password',  
        clientId: keycloakConfig.clientId ?? '',
        clientSecret: keycloakConfig.clientSecret ?? '',
        username: keycloakConfig.adminUser ?? '',
        password: keycloakConfig.adminPassword ?? '',
    });

    return kc;
}