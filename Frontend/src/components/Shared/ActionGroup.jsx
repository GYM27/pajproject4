import React from "react";
import ActionButton from "./ActionButton";
import {BUTTON_TYPES} from "./buttonConfigs";

const ActionGroup = ({actions = {}, item, isTrashMode, isAdmin, isBulk = false}) => {

    // Função auxiliar: Só desenha o botão se a função correspondente existir nas props
    const renderButton = (type, actionFn, tooltip) => {
        if (!actionFn) return null;
        return (
            <ActionButton
                {...type}
                onClick={() => isBulk ? actionFn() : actionFn(item)}
                tooltip={tooltip || type.tooltip}
            />
        );
    };

    return (
        <div className="d-flex gap-2">
            {!isTrashMode ? (
                /* --- MODO NORMAL --- */
                <>
                    {!isBulk ? (
                        <>
                            {renderButton(BUTTON_TYPES.VIEW, actions.onView)}
                            {renderButton(BUTTON_TYPES.EDIT, actions.onEdit)}
                            {renderButton(BUTTON_TYPES.DELETE, actions.onDelete)}
                        </>
                    ) : (
                        /* Ações Bulk para o Header */
                        isAdmin && renderButton(BUTTON_TYPES.DELETE, actions.onBulkDelete, "Mover Tudo para Lixeira")
                    )}
                </>
            ) : (
                /* --- MODO LIXEIRA --- */
                <>
                    {renderButton(BUTTON_TYPES.RESTORE, isBulk ? actions.onRestoreAll : actions.onRestore)}
                    {isAdmin && renderButton(
                        BUTTON_TYPES.HARD_DELETE,
                        isBulk ? actions.onEmptyTrash : actions.onHardDelete,
                        isBulk ? "Esvaziar Lixeira" : null
                    )}
                </>
            )}
        </div>
    );
};

export default ActionGroup;