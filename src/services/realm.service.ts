import KcAdminClient from "@keycloak/keycloak-admin-client";
import logger from "../utils/logger.js";

export class RealmService {
    constructor(private kc: KcAdminClient) {}

    async ensureRealm(realmName: string){
        const realms = await this.kc.realms.find();
        const exists = realms.some(r => r.realm === realmName);

        if(!exists){
            await this.kc.realms.create({realm: realmName, enabled: true});
            logger.info(`Realm ${realmName} created successfully`);
        }else{
            logger.info(`Realm ${realmName} already exists`);
        }

        // Switch admin client to the new realm
        this.kc.setConfig({realmName});
    }
}