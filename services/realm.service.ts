import IdentityProviderAdminClient from "@keycloak/keycloak-admin-client";
import logger from "../utils/logger.js";

export class RealmService {
    constructor(private idpAdminClient: IdentityProviderAdminClient) {}

    async ensureRealm(realmName: string){
        const realms = await this.idpAdminClient.realms.find();
        const exists = realms.some((r: { realm: string; }) => r.realm === realmName);

        if(!exists){
            await this.idpAdminClient.realms.create({realm: realmName, enabled: true});
            logger.debug(`Realm ${realmName} created successfully`);
        }else{
            logger.debug(`Realm ${realmName} already exists`);
        }

        // Switch admin client to the new realm
        this.idpAdminClient.setConfig({realmName});
    }
}