// /** ********************************************************************************
//     Copyright 2024 Subteno - Timothée Vannier (https://www.subteno.com).
//     License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
//  **********************************************************************************/

import {proxy, signal, useListener} from "@odoo/owl";
import {useBus, useService} from "@web/core/utils/hooks";
import {_t} from "@web/core/l10n/translation";

export function createFileDropZoneExtension() {
    return {
        setup() {
            super.setup(...arguments);
            this.dragState = proxy({
                showDragZone: false,
            });
            // The drop zone is the root of the renderer (its rootRef)
            useListener(this.rootRef, "dragover", this.highlight.bind(this));
            useListener(this.rootRef, "dragleave", this.unhighlight.bind(this));
            useListener(this.rootRef, "drop", this.onDrop.bind(this));
        },

        highlight(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            this.dragState.showDragZone = true;
        },

        unhighlight(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            this.dragState.showDragZone = false;
        },

        async onDrop(ev) {
            ev.preventDefault();
            this.dragState.showDragZone = false;
            await this.env.bus.trigger("change_file_input", {
                files: ev.dataTransfer.files,
            });
        },
    };
}

export function createFileUploadExtension() {
    return {
        setup() {
            super.setup();
            this.notification = useService("notification");
            this.orm = useService("orm");
            this.http = useService("http");
            this.fileInput = signal.ref();

            useBus(this.env.bus, "change_file_input", async (ev) => {
                this.fileInput().files = ev.detail.files;
                await this.onChangeFileInput();
            });
        },

        uploadDocument() {
            this.fileInput().click();
        },

        async onChangeFileInput() {
            const self = this;
            const controllerID = this.actionService.currentController.jsId;
            // Search the correct directory_id value according to the domain
            let directory_id = false;
            if (this.props.domain) {
                for (const domain_item of this.props.domain) {
                    if (domain_item.length === 3) {
                        if (
                            domain_item[0] === "directory_id" &&
                            ["=", "child_of"].includes(domain_item[1])
                        ) {
                            directory_id = domain_item[2];
                        }
                    }
                }
            }

            if (directory_id === false) {
                self.actionService.restore(controllerID);
                return self.notification.add(_t("You must select a directory first"), {
                    type: "danger",
                });
            }

            const params = {
                csrf_token: odoo.csrf_token,
                ufile: [...this.fileInput().files],
                directory_id: directory_id,
            };

            const fileData = await this.http.post(
                "/web/binary/upload_dms_file",
                params,
                "text"
            );
            const result = JSON.parse(fileData);
            for (const result_item of result) {
                if (result_item.error) {
                    this.notification.add(result_item.error, {
                        type: "danger",
                        sticky: true,
                    });
                }
            }
            self.actionService.restore(controllerID);
        },
    };
}
