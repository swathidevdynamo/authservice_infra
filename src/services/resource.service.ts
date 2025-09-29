import type KcAdminClient from '@keycloak/keycloak-admin-client';
import logger from '../utils/logger.js';

export class ResourceService {

    constructor(private kc: KcAdminClient) {}

    /**
     * Creates resources, then creates policies and permissions only after all resources are created successfully.
     * @param realm The realm name
     * @param resources Array of resource definitions
     * @param clientId The clientId
     * @param permissions Array of permission definitions (optional)
     * @param policies Array of policy definitions (optional)
     */
    async createResource(
        realm: string,
        resources: any[],
        clientId: string,
        permissions: any[],
        policies: any[]
    ) {
        this.kc.setConfig({ realmName: realm });

        const existingClients = await this.kc.clients.find();
        const client = existingClients.find((c: any) => c.clientId === clientId);
        if (!client) throw new Error(`Client ${clientId} not found`);
        
        // 1. Create all resources first
        for (const res of resources) {
            try {
                await this.kc.clients.createResource(
                    { id: client.id ?? '' },
                    {
                        name: res.name,
                        displayName: res.displayName,
                        ownerManagedAccess: res.ownerManagedAccess,
                        attributes: res.attributes,
                        uris: Array.isArray(res.uris) ? res.uris : (res.uri ? [res.uri] : []),
                        icon_uri: res.icon_uri,
                        scopes: res.scopes,
                    }
                );
                logger.info(`Resource '${res.name}' created successfully`);
            } catch (error: any) {
                const status = error?.response?.status;
                const errCode = error?.responseData?.error;
                if (status === 409 || errCode === 'conflict') {
                    logger.info(`Resource '${res.name}' already exists. Skipping.`);
                    continue;
                }
                throw error;
            }
        }

        // Prepare client roles lookup for policy resolution
        const clientRoles = await this.kc.clients.listRoles({ id: client.id! });

        // 2. After all resources are created, create policies (if any)
        if (policies && policies.length > 0) {
            for (const pol of policies) {
                try {
                    let payload: any = {
                        name: pol.name,
                        decisionStrategy: pol.decisionStrategy,
                        logic: pol.logic,
                        description: pol.description,
                    };

                    if (pol.type === 'role') {
                        const resolvedRoles = (pol.roles ?? []).map((r: any) => {
                            // Resolve by name against client roles
                            const found = clientRoles.find(cr => cr.name === r.name);
                            if (!found) {
                                throw new Error(`Policy '${pol.name}' references unknown role '${r.name}'`);
                            }
                            return { id: found.id!, required: !!r.required };
                        });
                        payload.roles = resolvedRoles;
                    }

                    await this.kc.clients.createPolicy(
                        { id: client.id ?? '', type: pol.type },
                        payload
                    );
                    logger.info(`Policy '${pol.name}' created successfully`);
                } catch (error: any) {
                    const status = error?.response?.status;
                    const errCode = error?.responseData?.error;
                    if (status === 409 || errCode === 'conflict') {
                        logger.info(`Policy '${pol.name}' already exists. Skipping.`);
                        continue;
                    }
                    throw error;
                }
            }
        }

        // 3. After policies, create permissions (if any)
        if (permissions && permissions.length > 0) {
            for (const perm of permissions) {
                try {
                    await this.kc.clients.createPermission(
                        { id: client.id ?? '', type: perm.type },
                        {
                            name: perm.name,
                            logic: perm.logic,
                            decisionStrategy: perm.decisionStrategy,
                            resources: perm.resources,
                            scopes: perm.scopes,
                            policies: perm.policies,
                            description: perm.description,
                        }
                    );
                    logger.info(`Permission '${perm.name}' created successfully`);
                } catch (error: any) {
                    const status = error?.response?.status;
                    const errCode = error?.responseData?.error;
                    if (status === 409 || errCode === 'conflict') {
                        logger.info(`Permission '${perm.name}' already exists. Skipping.`);
                        continue;
                    }
                    throw error;
                }
            }
        }
    }

    // // For backward compatibility, keep the original methods, but recommend using the new one above.
    // async createResource(realm: string, resources: any[], clientId: string, permissions: any[], policies: any[]) {
    //     return this.createResourcesWithPermissionsAndPolicies(realm, resources, clientId, permissions, policies);
    // }

    // async createPermission(realm: string, permissions: any[], clientId: string) {
    //     // This method will only create permissions, assuming resources already exist.
    //     this.kc.setConfig({ realmName: realm });

    //     const existingClients = await this.kc.clients.find();
    //     const client = existingClients.find((c: any) => c.clientId === clientId);
    //     if (!client) throw new Error(`Client ${clientId} not found`);

    //     for (const perm of permissions) {
    //         try {
    //             await this.kc.clients.createPermission(
    //                 { id: client.id ?? '', type: perm.type },
    //                 {
    //                     name: perm.name,
    //                     type: perm.type,
    //                     logic: perm.logic,
    //                     decisionStrategy: perm.decisionStrategy,
    //                     resources: perm.resources,
    //                     scopes: perm.scopes,
    //                     policies: perm.policies,
    //                     description: perm.description,
    //                 }
    //             );
    //             console.log(`Permission '${perm.name}' created successfully`);
    //         } catch (error: any) {
    //             const status = error?.response?.status;
    //             const errCode = error?.responseData?.error;
    //             if (status === 409 || errCode === 'conflict') {
    //                 console.log(`Permission '${perm.name}' already exists. Skipping.`);
    //                 continue;
    //             }
    //             throw error;
    //         }
    //     }
    // }

    // async createPolicy(realm: string, policies: any[], clientId: string) {
    //     // This method will only create policies, assuming resources and permissions already exist.
    //     this.kc.setConfig({ realmName: realm });

    //     const existingClients = await this.kc.clients.find();
    //     const client = existingClients.find((c: any) => c.clientId === clientId);
    //     if (!client) throw new Error(`Client ${clientId} not found`);

    //     for (const pol of policies) {
    //         try {
    //             await this.kc.clients.createPolicy(
    //                 { id: client.id ?? '', type: pol.type },
    //                 {
    //                     name: pol.name,
    //                     type: pol.type,
    //                     logic: pol.logic,
    //                     decisionStrategy: pol.decisionStrategy,
    //                     users: pol.users,
    //                     roles: pol.roles,
    //                     description: pol.description,
    //                     config: pol.config,
    //                 }
    //             );
    //             console.log(`Policy '${pol.name}' created successfully`);
    //         } catch (error: any) {
    //             const status = error?.response?.status;
    //             const errCode = error?.responseData?.error;
    //             if (status === 409 || errCode === 'conflict') {
    //                 console.log(`Policy '${pol.name}' already exists. Skipping.`);
    //                 continue;
    //             }
    //             throw error;
    //         }
    //     }
    // }
}