module.exports = class Data1743682984788 {
    name = 'Data1743682984788'

    async up(db) {
        await db.query(`CREATE TABLE "account_multisig" ("id" character varying NOT NULL, "multisig_id" character varying, "signatory_id" character varying, CONSTRAINT "PK_9c47c4be06a450da56b95bf3e06" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_373149008deefb43018021ac00" ON "account_multisig" ("multisig_id") `)
        await db.query(`CREATE INDEX "IDX_b9094826e16b3725b5bcb814b1" ON "account_multisig" ("signatory_id") `)
        await db.query(`CREATE TABLE "proxy_account" ("id" character varying NOT NULL, "type" character varying(17) NOT NULL, "delay" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "extrinsic_index" integer, "creation_block_number" integer, "delegator_id" character varying, "delegatee_id" character varying, CONSTRAINT "PK_ec6559af2b2f1e64069037b7eef" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_f88663d41538b675ba6787b168" ON "proxy_account" ("delegator_id") `)
        await db.query(`CREATE INDEX "IDX_bd9bcaf30e85ab22af2710b822" ON "proxy_account" ("delegatee_id") `)
        await db.query(`CREATE TABLE "multisig_call" ("id" character varying NOT NULL, "block_hash" text NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "call_index" integer NOT NULL, "multisig_id" character varying, CONSTRAINT "PK_fa22322b62825a7b48838d98e17" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_2f1479a9dfc96f8d277b11cb10" ON "multisig_call" ("multisig_id") `)
        await db.query(`CREATE TABLE "account" ("id" character varying NOT NULL, "pub_key" text NOT NULL, "is_pure_proxy" boolean, "is_multisig" boolean, "threshold" integer, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "multisig_tx" ("id" character varying NOT NULL, "block_number" integer NOT NULL, "origin_block_number" integer NOT NULL, "origin_extrinsic_index" integer NOT NULL, "call_data" text, "status" character varying(9) NOT NULL, "multisig_id" character varying, CONSTRAINT "PK_e871543d680e3a2677d267979da" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_2ef45bcd96b19fa34af9a80893" ON "multisig_tx" ("multisig_id") `)
        await db.query(`ALTER TABLE "account_multisig" ADD CONSTRAINT "FK_373149008deefb43018021ac009" FOREIGN KEY ("multisig_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "account_multisig" ADD CONSTRAINT "FK_b9094826e16b3725b5bcb814b19" FOREIGN KEY ("signatory_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "proxy_account" ADD CONSTRAINT "FK_f88663d41538b675ba6787b1686" FOREIGN KEY ("delegator_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "proxy_account" ADD CONSTRAINT "FK_bd9bcaf30e85ab22af2710b8225" FOREIGN KEY ("delegatee_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "multisig_call" ADD CONSTRAINT "FK_2f1479a9dfc96f8d277b11cb109" FOREIGN KEY ("multisig_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "multisig_tx" ADD CONSTRAINT "FK_2ef45bcd96b19fa34af9a80893e" FOREIGN KEY ("multisig_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "account_multisig"`)
        await db.query(`DROP INDEX "public"."IDX_373149008deefb43018021ac00"`)
        await db.query(`DROP INDEX "public"."IDX_b9094826e16b3725b5bcb814b1"`)
        await db.query(`DROP TABLE "proxy_account"`)
        await db.query(`DROP INDEX "public"."IDX_f88663d41538b675ba6787b168"`)
        await db.query(`DROP INDEX "public"."IDX_bd9bcaf30e85ab22af2710b822"`)
        await db.query(`DROP TABLE "multisig_call"`)
        await db.query(`DROP INDEX "public"."IDX_2f1479a9dfc96f8d277b11cb10"`)
        await db.query(`DROP TABLE "account"`)
        await db.query(`DROP TABLE "multisig_tx"`)
        await db.query(`DROP INDEX "public"."IDX_2ef45bcd96b19fa34af9a80893"`)
        await db.query(`ALTER TABLE "account_multisig" DROP CONSTRAINT "FK_373149008deefb43018021ac009"`)
        await db.query(`ALTER TABLE "account_multisig" DROP CONSTRAINT "FK_b9094826e16b3725b5bcb814b19"`)
        await db.query(`ALTER TABLE "proxy_account" DROP CONSTRAINT "FK_f88663d41538b675ba6787b1686"`)
        await db.query(`ALTER TABLE "proxy_account" DROP CONSTRAINT "FK_bd9bcaf30e85ab22af2710b8225"`)
        await db.query(`ALTER TABLE "multisig_call" DROP CONSTRAINT "FK_2f1479a9dfc96f8d277b11cb109"`)
        await db.query(`ALTER TABLE "multisig_tx" DROP CONSTRAINT "FK_2ef45bcd96b19fa34af9a80893e"`)
    }
}
