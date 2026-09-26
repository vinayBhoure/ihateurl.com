"use client";

import { useOptimistic, useState, useTransition, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  FolderInput,
  Link2,
  MinusCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { CategoryOption } from "@/components/category-picker";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { LinkEditDialog } from "@/components/link-edit-dialog";
import { LinkRow, type LinkRowData } from "@/components/link-row";
import { MoveLinkDialog, type MoveTarget } from "@/components/move-link-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { itemIdSchema, linkIdSchema } from "@/lib/validations/link";
import { deleteLink, removeLinkFromCollection, reorderCollectionItems } from "@/server/actions/link";

export type CollectionLinkItem = {
  itemId: string;
  link: LinkRowData & { id: string; description: string | null };
};

type Shared = { categories: CategoryOption[]; moveTargets: MoveTarget[] };

/** Link rows with actions. Reorder (FD3: up/down only) is optimistic and rolls back on error. */
export function CollectionLinks({
  collectionId,
  items,
  categories,
  moveTargets,
}: { collectionId: string; items: CollectionLinkItem[] } & Shared) {
  const [optimisticItems, setOptimisticItems] = useOptimistic(items);
  const [, startTransition] = useTransition();

  function move(index: number, delta: -1 | 1) {
    const next = [...optimisticItems];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    startTransition(async () => {
      setOptimisticItems(next);
      try {
        const result = await reorderCollectionItems({ collectionId, itemIds: next.map((i) => i.itemId) });
        if (!result.ok) toast.error(result.error);
      } catch {
        toast.error("Couldn't reach the server. Check your connection and try again.");
      }
    });
  }

  if (optimisticItems.length === 0) {
    return <EmptyState icon={Link2} title="No links yet" description="Paste a URL above." />;
  }

  return (
    <ul className="divide-y rounded-lg border">
      {optimisticItems.map((item, index) => (
        <li key={item.itemId}>
          <LinkRow
            link={item.link}
            actions={
              <LinkRowActions
                item={item}
                categories={categories}
                moveTargets={moveTargets}
                canMoveUp={index > 0}
                canMoveDown={index < optimisticItems.length - 1}
                onMove={(delta) => move(index, delta)}
              />
            }
          />
        </li>
      ))}
    </ul>
  );
}

type OpenDialog = "edit" | "move" | "remove" | "delete" | null;

function LinkRowActions({
  item,
  categories,
  moveTargets,
  canMoveUp,
  canMoveDown,
  onMove,
}: {
  item: CollectionLinkItem;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (delta: -1 | 1) => void;
} & Shared) {
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const name = item.link.title || item.link.domain || item.link.url;
  const openChange = (which: Exclude<OpenDialog, null>) => (open: boolean) => setDialog(open ? which : null);

  return (
    <>
      {/* ≥ 768 px: buttons. Below that the same moves live in the menu (§5.5). */}
      <div className="hidden items-center gap-1 md:flex">
        <IconButton label="Move up" disabled={!canMoveUp} onClick={() => onMove(-1)}>
          <ArrowUp />
        </IconButton>
        <IconButton label="Move down" disabled={!canMoveDown} onClick={() => onMove(1)}>
          <ArrowDown />
        </IconButton>
      </div>

      {/* All widths (C2.3): pencil sits before the ⋯ menu, which no longer has its own Edit item. */}
      <IconButton label="Edit link" disabled={false} onClick={() => setDialog("edit")}>
        <Pencil />
      </IconButton>

      <DropdownMenu modal={false}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${name}`}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Link actions</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="md:hidden" disabled={!canMoveUp} onSelect={() => onMove(-1)}>
            <ArrowUp />
            Move up
          </DropdownMenuItem>
          <DropdownMenuItem className="md:hidden" disabled={!canMoveDown} onSelect={() => onMove(1)}>
            <ArrowDown />
            Move down
          </DropdownMenuItem>
          <DropdownMenuSeparator className="md:hidden" />
          <DropdownMenuItem onSelect={() => setDialog("move")}>
            <FolderInput />
            Move to…
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setDialog("remove")}>
            <MinusCircle />
            Remove from collection
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setDialog("delete")}>
            <Trash2 />
            Delete link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LinkEditDialog
        open={dialog === "edit"}
        onOpenChange={openChange("edit")}
        categories={categories}
        link={{
          id: item.link.id,
          title: item.link.title,
          description: item.link.description,
          categoryIds: item.link.categories.map((c) => c.id),
        }}
      />
      <MoveLinkDialog
        open={dialog === "move"}
        onOpenChange={openChange("move")}
        itemId={item.itemId}
        targets={moveTargets}
      />
      <ConfirmDialog
        open={dialog === "remove"}
        onOpenChange={openChange("remove")}
        title="Remove from this collection?"
        description="If this collection is the only one holding the link, the link is deleted too."
        confirmLabel="Remove"
        schema={itemIdSchema}
        action={removeLinkFromCollection}
        input={{ itemId: item.itemId }}
        onSuccess={({ linkDeleted }) =>
          toast.success(linkDeleted ? "Removed. It was in no other collection, so the link was deleted." : "Removed from collection")
        }
      />
      <ConfirmDialog
        open={dialog === "delete"}
        onOpenChange={openChange("delete")}
        title="Delete this link?"
        description="It's removed from every collection. This can't be undone."
        confirmLabel="Delete link"
        schema={linkIdSchema}
        action={deleteLink}
        input={{ id: item.link.id }}
        onSuccess={() => toast.success("Link deleted")}
      />
    </>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label={label} disabled={disabled} onClick={onClick}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
