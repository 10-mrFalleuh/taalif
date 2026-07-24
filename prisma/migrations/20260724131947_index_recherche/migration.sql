-- CreateIndex
CREATE INDEX "taalifs_dateCreation_idx" ON "taalifs"("dateCreation");

-- CreateIndex
CREATE INDEX "taalifs_format_dateCreation_idx" ON "taalifs"("format", "dateCreation");

-- CreateIndex
CREATE INDEX "taalifs_theme_idx" ON "taalifs"("theme");

-- CreateIndex
CREATE INDEX "taalifs_estTaalifDuJour_idx" ON "taalifs"("estTaalifDuJour");

-- CreateIndex
CREATE INDEX "actualites_publiee_createdAt_idx" ON "actualites"("publiee", "createdAt");

-- CreateIndex
CREATE INDEX "actualites_categorie_idx" ON "actualites"("categorie");

-- CreateIndex
CREATE INDEX "actualites_createdAt_idx" ON "actualites"("createdAt");

