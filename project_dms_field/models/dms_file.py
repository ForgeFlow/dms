# Copyright 2026 ForgeFlow S.L. (https://www.forgeflow.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, models


class DmsFile(models.Model):
    _inherit = "dms.file"

    @api.model
    def search_panel_select_range(self, field_name, **kwargs):
        """The folders of the project only, when the files are opened from the
        Documents button of the project: its subfolders at the first level
        (the folder of the project itself is the "All" entry)."""
        directory_id = self.env.context.get("project_dms_directory_id")
        if field_name != "directory_id" or not directory_id:
            return super().search_panel_select_range(field_name, **kwargs)
        res = super(
            DmsFile,
            self.with_context(active_model="dms.directory", active_id=directory_id),
        ).search_panel_select_range(field_name, **kwargs)
        values = []
        for value in res["values"]:
            if value["id"] == directory_id:
                continue
            if value["parent_id"] == directory_id:
                value["parent_id"] = False
            values.append(value)
        res["values"] = values
        return res
