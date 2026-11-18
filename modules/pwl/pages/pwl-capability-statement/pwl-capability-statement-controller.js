'use strict';

import { PageController, loopar, getCompany, fileManager } from 'loopar';

// What the public sheet may show of the Company record.
const COMPANY_FIELDS = ['company_name', 'legal_name', 'email', 'phone', 'website', 'address', 'city', 'state', 'postal_code'];

const firstSrc = (files) => fileManager.getMappedFiles(files)[0]?.src || null;

export default class PwlCapabilityStatementController extends PageController {
    constructor(props){
        super(props);
    }

    /**
     * Live data of the capability statement: the services the site publishes
     * and the company's contact details, so the sheet never drifts from the
     * website. Data endpoint: no `message` key, so the client keeps the payload.
     */
    async publicActionStatement() {
        const webApp = loopar.webApp || {};
        const [company, rows] = await Promise.all([
            getCompany(),
            loopar.db.getAll('Service', ['title', 'order'], { app: webApp.name, published: 1 }),
        ]);

        const services = [...rows]
            .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
            .map((row) => row.title)
            .filter(Boolean);

        return {
            services,
            company: Object.fromEntries(COMPANY_FIELDS.map((field) => [field, company?.[field] || ''])),
            // The light logo: the sheet's header is dark.
            logo: firstSrc(webApp.logo_dark) || firstSrc(webApp.logo),
        };
    }
}
