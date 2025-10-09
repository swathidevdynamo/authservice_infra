import { RealmService } from "./realm.service.js";
import { ClientService } from "./client.service.js";
import { GroupService } from "./group.service.js";
import { RoleService } from "./role.service.js";
import { ServiceAccountService } from "./service-account.service.js";
import { ResourceService } from "./resource.service.js";
import { IDPConfig } from "../config/identityprovider.config.js";
import logger from "../utils/logger.js";

export class ProvisionService {
  constructor(
    private realmService: RealmService,
    private clientService: ClientService,
    private groupService: GroupService,
    private roleService: RoleService,
    private serviceAccountService: ServiceAccountService,
    private resourceService: ResourceService
  ) {}

  async provision(
    realmName: string,
    clientId: string,
    clientSecret: string,
    groups: string[],
    roles: string[],
    groupRoleMap: Record<string, string[]>,
    serviceAccountRoles: string[],
    redirectUris: string[] = []
  ) {
    await this.realmService.ensureRealm(realmName);
    await this.clientService.ensureClient(clientId, clientSecret, redirectUris);
    await this.groupService.ensureGroups(groups);
    await this.roleService.ensureRoles(roles);
    await this.resourceService.createResource(
      realmName,
      IDPConfig.resources ?? [],
      IDPConfig.myClient ?? '',
      IDPConfig.permissions ?? [],
      IDPConfig.policies ?? []
    );

    for (const [group, assignedRoles] of Object.entries(groupRoleMap)) {
      for (const role of assignedRoles) {
        await this.roleService.assignRoleToGroup(role, group);
      }
    }

    await this.serviceAccountService.assignRolesToServiceAccount(clientId, serviceAccountRoles);

    logger.debug("🎉 Identity Provider Initialization completed!");
  }
}
