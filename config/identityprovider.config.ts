import realmClientConfig from './realm-client-user-group-config.json' with { type: 'json' };
import resourceConfig from './resource-config.json' with { type: 'json' };
import crypto from 'crypto';


export const IDPConfig = {
    // Identity Provider server base URL
    baseUrl: process.env.IDP_BASE_URL || "http://localhost:8089" ,
  
    masterRealm: process.env.IDP_MASTER_REALM || "master" ,
    clientId: process.env.IDP_CLIENT_ID || "admin-cli" ,
    // Generate a client secret at runtime if not provided in environment
    clientSecret: (() => {
      return crypto.randomBytes(32).toString('hex');
    })(),
  
    // Admin credentials (used to authenticate with Identity Provider Admin API)
    adminUser: process.env.IDP_ADMIN_USER ,
    adminPassword: process.env.IDP_ADMIN_PASSWORD ,

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
  