# Copyright 2026 Windweaver
# Copyright 2026 ForgeFlow S.L. (https://www.forgeflow.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from markupsafe import Markup

from odoo import models
from odoo.exceptions import UserError


class ProjectProject(models.Model):
    _name = "project.project"
    _inherit = ("project.project", "dms.field.mixin")

    def action_open_dms_documents(self):
        """The files of the folder of the project and of its subfolders (the
        Documents button of the bar of the project)."""
        self.ensure_one()
        directory = self.dms_directory_ids[:1]
        if not directory:
            raise UserError(
                self.env._(
                    "The project %(project)s has no documents folder yet. Create "
                    "it from the Documents tab of the project form.",
                    project=self.display_name,
                )
            )
        action = self.env["ir.actions.act_window"]._for_xml_id(
            "dms.action_dms_files_all_directory"
        )
        # The texts in the language of the user (the context of the buttons
        # of the bar does not carry it)
        self = self.with_context(lang=self.env.user.lang)  # noqa: PLW0642
        name = self.env._("Documents")
        action.update(
            {
                "name": name,
                "display_name": name,
                "help": Markup(
                    '<p class="o_view_nocontent_smiling_face">%s</p><p>%s</p>'
                )
                % (
                    self.env._("Upload the documents of the project"),
                    self.env._("Its folders are in the side panel."),
                ),
                "domain": [
                    ("is_hidden", "=", False),
                    ("directory_id", "child_of", directory.id),
                ],
                # The search panel shows the folders of the project (active_id
                # stays the project: the bar of the project needs it)
                "context": {
                    "project_dms_directory_id": directory.id,
                    "default_directory_id": directory.id,
                },
            }
        )
        return action
