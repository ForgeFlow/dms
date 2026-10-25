# Copyright 2026 Windweaver
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Add dms field for projects",
    "version": "20.0.1.1.0",
    "category": "Project",
    "website": "https://github.com/OCA/dms",
    "author": "Windweaver, ForgeFlow, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "depends": ["project", "dms_field"],
    "installable": True,
    "data": [
        "views/project_project_views.xml",
        "views/project_embedded_actions.xml",
    ],
    "demo": ["demo/dms_data.xml"],
    "maintainers": ["windweaver828"],
}
