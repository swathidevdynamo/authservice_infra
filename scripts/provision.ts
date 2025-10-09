import { createIdentityProviderClient } from "../identityprovider/admin.js";  
import { RealmService } from "../services/realm.service.js";
import { ClientService } from "../services/client.service.js";
import { GroupService } from "../services/group.service.js";
import { RoleService } from "../services/role.service.js";
import { ServiceAccountService } from "../services/service-account.service.js";
import { ProvisionService } from "../services/provision.service.js";
import { IDPConfig } from "../config/index.js";
import { ResourceService } from "../services/resource.service.js";


export const provision = async () => {
  const idpAdminClient = await createIdentityProviderClient();


  const realmService = new RealmService(idpAdminClient);
  const clientService = new ClientService(idpAdminClient);
  const groupService = new GroupService(idpAdminClient);
  const roleService = new RoleService(idpAdminClient);
  const serviceAccountService = new ServiceAccountService(idpAdminClient);

  const resourceService = new ResourceService(idpAdminClient);
  const provision = new ProvisionService(
    realmService,
    clientService,
    groupService,
    roleService,
    serviceAccountService,
    resourceService
  );
  await provision.provision(
    IDPConfig.myRealm,
    IDPConfig.myClient ?? '',
    IDPConfig.clientSecret,
    IDPConfig.groups?.map((group: { name: string; }) => group.name) ?? [],
    IDPConfig.roles ?? [],
    // Map group names to their client role mappings
    IDPConfig.groups?.reduce((acc, group: { name: string; clientRoleMappings: { roles: string[]; }[]; }) => {
       acc[group.name ?? ''] = group.clientRoleMappings?.flatMap((mapping: { roles: string[]; }) => mapping.roles) || [];
      return acc;
    }, {} as Record<string, string[]>),
    // No default users/roles provided, so pass empty arrays or as needed
    [],
    []
  );
};
