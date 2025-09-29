import KcAdminClient from "@keycloak/keycloak-admin-client";
import logger from "../utils/logger.js";

export class ClientService {
  constructor(private kc: KcAdminClient) {}

  async ensureClient(clientId: string, clientSecret: string, redirectUris: string[] = []) {
    const clients = await this.kc.clients.find();
    const exists = clients.some(c => c.clientId === clientId);

    if (!exists) {
      await this.kc.clients.create({
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
      logger.info(`✅ Client '${clientId}' created`);
    } else {
      logger.info(`ℹ️ Client '${clientId}' already exists`);
    }
  }
}
