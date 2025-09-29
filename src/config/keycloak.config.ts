import realmClientConfig from './realm-client-user-group-config.json' with { type: 'json' };
import resourceConfig from './resource-config.json' with { type: 'json' };
import crypto from 'crypto';


export const keycloakConfig = {
    // Keycloak server base URL
    baseUrl: process.env.KEYCLOAK_BASE_URL || "http://localhost:8088" ,
  
    masterRealm: process.env.KEYCLOAK_MASTER_REALM || "master" ,
    clientId: process.env.KEYCLOAK_CLIENT_ID || "admin-cli" ,
    // Generate a client secret at runtime if not provided in environment
    clientSecret: (() => {
      return crypto.randomBytes(32).toString('hex');
    })(),
  
    // Admin credentials (used to authenticate with Keycloak Admin API)
    adminUser: process.env.KEYCLOAK_ADMIN_USER || "kcneuraadmin" ,
    adminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD || "kcneuraadmin" ,

    // Realm and client information
    // Load realm and clientId from realm-client-user-group-config.json
    // (Assumes the file is in the same directory as this config)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    myRealm: realmClientConfig?.realm,
    myClient: realmClientConfig?.clients?.[0]?.client_id,
    groups: realmClientConfig?.groups,
    roles: realmClientConfig?.clients?.[0]?.roles?.map((r: any) => r?.name) ?? [],

    // Authorization config
    resources: resourceConfig?.resources ?? [],
    permissions: resourceConfig?.permissions ?? [],
    policies: resourceConfig?.policies ?? [],
    policyEnforcementMode: resourceConfig?.policyEnforcementMode
  };
  