import { createKeycloakClient } from "../keycloak/admin.js";
import { RealmService } from "../services/realm.service.js";
import { ClientService } from "../services/client.service.js";
import { GroupService } from "../services/group.service.js";
import { RoleService } from "../services/role.service.js";
import { ServiceAccountService } from "../services/service-account.service.js";
import { ProvisionService } from "../services/provision.service.js";
import { keycloakConfig } from "../config/index.js";
import { ResourceService } from "../services/resource.service.js";


export const provision = async () => {
  const kc = await createKeycloakClient();


  const realmService = new RealmService(kc);
  const clientService = new ClientService(kc);
  const groupService = new GroupService(kc);
  const roleService = new RoleService(kc);
  const serviceAccountService = new ServiceAccountService(kc);

  const resourceService = new ResourceService(kc);
  const provision = new ProvisionService(
    realmService,
    clientService,
    groupService,
    roleService,
    serviceAccountService,
    resourceService
  );
  await provision.provision(
    keycloakConfig.myRealm,
    keycloakConfig.myClient ?? '',
    keycloakConfig.clientSecret,
    keycloakConfig.groups?.map(group => group.name) ?? [],
    keycloakConfig.roles ?? [],
    // Map group names to their client role mappings
    keycloakConfig.groups?.reduce((acc, group) => {
       acc[group.name ?? ''] = group.clientRoleMappings?.flatMap(mapping => mapping.roles) || [];
      return acc;
    }, {} as Record<string, string[]>),
    // No default users/roles provided, so pass empty arrays or as needed
    [],
    []
  );
};
