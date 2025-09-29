import KcAdminClient from "@keycloak/keycloak-admin-client";
import logger from "../utils/logger.js";

export class ServiceAccountService {
  constructor(private kc: KcAdminClient) {}

  async getServiceAccountUser(clientId: string) {
    const clients = await this.kc.clients.find();
    const client = clients.find(c => c.clientId === clientId);
    if (!client) throw new Error(`Client '${clientId}' not found`);

    const user = await this.kc.clients.getServiceAccountUser({ id: client.id! });
    return user;
  }

  async assignRolesToServiceAccount(clientId: string, roleNames: string[]) {
    const user = await this.getServiceAccountUser(clientId);
    const roles = await this.kc.roles.find();
    const assignedRoles = roles.filter(r => roleNames.includes(r.name ?? ''));

    if (assignedRoles.length === 0) return;

    await this.kc.users.addRealmRoleMappings({
      id: user.id!,
      roles: assignedRoles.map(r => ({ id: r.id!, name: r.name! })),
    });

    logger.info(`✅ Roles [${roleNames.join(", ")}] assigned to service account of client '${clientId}'`);
  }
}
