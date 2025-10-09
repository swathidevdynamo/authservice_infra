import IdentityProviderAdminClient from "@keycloak/keycloak-admin-client";
import logger from "../utils/logger.js";

export class ClientService {
  constructor(private idpAdminClient: IdentityProviderAdminClient) {}

  async ensureClient(clientId: string, clientSecret: string, redirectUris: string[] = []) {
    const clients = await this.idpAdminClient.clients.find();
    const exists = clients.some((c: { clientId: string; }) => c.clientId === clientId);

    if (!exists) {
      await this.idpAdminClient.clients.create({
        clientId,
        secret: clientSecret,
        publicClient: false,
        protocol: "openid-connect",
        directAccessGrantsEnabled: true,
        serviceAccountsEnabled: true,
        authorizationServicesEnabled: true,
        standardFlowEnabled: true,
        implicitFlowEnabled: false,
        redirectUris,
      });
      logger.debug(`✅ Client '${clientId}' created`);
    } else {
      logger.debug(`ℹ️ Client '${clientId}' already exists`);
    }
  }
}
