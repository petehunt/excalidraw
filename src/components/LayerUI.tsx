import React, { useRef, RefObject, useEffect, useCallback } from "react";
import { showSelectedShapeActions } from "../element";
import { calculateScrollCenter } from "../scene";
import { exportCanvas } from "../data";

import { AppState } from "../types";
import {
  NonDeletedExcalidrawElement,
  ExcalidrawElement,
  NonDeleted,
} from "../element/types";

import { ActionManager } from "../actions/manager";
import { Island } from "./Island";
import Stack from "./Stack";
import { FixedSideContainer } from "./FixedSideContainer";
import { UserList } from "./UserList";
import { LockIcon } from "./LockIcon";
import { ExportDialog, ExportCB } from "./ExportDialog";
import { LanguageList } from "./LanguageList";
import { t, languages, setLanguage } from "../i18n";
import { HintViewer } from "./HintViewer";
import useIsMobile from "../is-mobile";

import { ExportType } from "../scene/types";
import { MobileMenu } from "./MobileMenu";
import { ZoomActions, SelectedShapeActions, ShapesSwitcher } from "./Actions";
import { Section } from "./Section";
import { RoomDialog } from "./RoomDialog";
import { ErrorDialog } from "./ErrorDialog";
import { ShortcutsDialog } from "./ShortcutsDialog";
import { LoadingMessage } from "./LoadingMessage";
import { CLASSES } from "../constants";
import { shield } from "./icons";
import { GitHubCorner } from "./GitHubCorner";
import { Tooltip } from "./Tooltip";

import "./LayerUI.scss";
import { LibraryUnit } from "./LibraryUnit";

interface LayerUIProps {
  actionManager: ActionManager;
  appState: AppState;
  canvas: HTMLCanvasElement | null;
  setAppState: any;
  elements: readonly NonDeletedExcalidrawElement[];
  onRoomCreate: () => void;
  onUsernameChange: (username: string) => void;
  onRoomDestroy: () => void;
  onLockToggle: () => void;
  onInsertShape: (elements: readonly NonDeleted<ExcalidrawElement>[]) => void;
  zenModeEnabled: boolean;
  toggleZenMode: () => void;
  lng: string;
}

function useOnClickOutside(
  ref: RefObject<HTMLElement>,
  cb: (event: MouseEvent) => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current) {
        return;
      }

      if (
        event.target instanceof Element &&
        (ref.current.contains(event.target) ||
          !document.body.contains(event.target))
      ) {
        return;
      }

      cb(event);
    };
    document.addEventListener("click", listener, false);

    return () => {
      document.removeEventListener("click", listener);
    };
  }, [ref, cb]);
}

const LibraryMenu = ({
  library,
  onClickOutside,
  onRemoveFromLibrary,
  onInsertShape,
}: {
  library: readonly NonDeleted<ExcalidrawElement>[][];
  onClickOutside: (event: MouseEvent) => void;
  onRemoveFromLibrary: (index: number) => void;
  onInsertShape: (elements: readonly NonDeleted<ExcalidrawElement>[]) => void;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(ref, onClickOutside);

  const CELLS_PER_ROW = 3;
  const numRows = Math.ceil(library.length / CELLS_PER_ROW);
  const rows = [];
  for (let row = 0; row < numRows; row++) {
    const i = CELLS_PER_ROW * row;
    rows.push(
      <Stack.Row align="center" gap={1} key={row}>
        <Stack.Col>
          <LibraryUnit
            elements={library[i]}
            onRemoveFromLibrary={onRemoveFromLibrary.bind(null, i)}
            onClick={onInsertShape.bind(null, library[i])}
          />
        </Stack.Col>
        <Stack.Col>
          <LibraryUnit
            elements={library[i + 1]}
            onRemoveFromLibrary={onRemoveFromLibrary.bind(null, i + 1)}
            onClick={onInsertShape.bind(null, library[i + 1])}
          />
        </Stack.Col>
        <Stack.Col>
          <LibraryUnit
            elements={library[i + 2]}
            onRemoveFromLibrary={onRemoveFromLibrary.bind(null, i + 2)}
            onClick={onInsertShape.bind(null, library[i + 2])}
          />
        </Stack.Col>
      </Stack.Row>,
    );
  }

  return (
    <Island padding={1} ref={ref}>
      <Stack.Col align="center" gap={1}>
        {rows}
      </Stack.Col>
    </Island>
  );
};

const LayerUI = ({
  actionManager,
  appState,
  setAppState,
  canvas,
  elements,
  onRoomCreate,
  onUsernameChange,
  onRoomDestroy,
  onLockToggle,
  onInsertShape,
  zenModeEnabled,
  toggleZenMode,
}: LayerUIProps) => {
  const isMobile = useIsMobile();

  // TODO: Extend tooltip component and use here.
  const renderEncryptedIcon = () => (
    <a
      className={`encrypted-icon tooltip zen-mode-visibility ${
        zenModeEnabled ? "zen-mode-visibility--hidden" : ""
      }`}
      href="https://blog.excalidraw.com/end-to-end-encryption/"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="tooltip-text" dir="auto">
        {t("encrypted.tooltip")}
      </span>
      {shield}
    </a>
  );

  const renderExportDialog = () => {
    const createExporter = (type: ExportType): ExportCB => (
      exportedElements,
      scale,
    ) => {
      if (canvas) {
        exportCanvas(type, exportedElements, appState, canvas, {
          exportBackground: appState.exportBackground,
          name: appState.name,
          viewBackgroundColor: appState.viewBackgroundColor,
          scale,
          shouldAddWatermark: appState.shouldAddWatermark,
        });
      }
    };
    return (
      <ExportDialog
        elements={elements}
        appState={appState}
        actionManager={actionManager}
        onExportToPng={createExporter("png")}
        onExportToSvg={createExporter("svg")}
        onExportToClipboard={createExporter("clipboard")}
        onExportToBackend={(exportedElements) => {
          if (canvas) {
            exportCanvas(
              "backend",
              exportedElements,
              {
                ...appState,
                selectedElementIds: {},
              },
              canvas,
              appState,
            );
          }
        }}
      />
    );
  };

  const renderCanvasActions = () => (
    <Section
      heading="canvasActions"
      className={`zen-mode-transition ${zenModeEnabled && "transition-left"}`}
    >
      {/* the zIndex ensures this menu has higher stacking order,
         see https://github.com/excalidraw/excalidraw/pull/1445 */}
      <Island padding={4} style={{ zIndex: 1 }}>
        <Stack.Col gap={4}>
          <Stack.Row gap={1} justifyContent="space-between">
            {actionManager.renderAction("loadScene")}
            {actionManager.renderAction("saveScene")}
            {actionManager.renderAction("saveAsScene")}
            {renderExportDialog()}
            {actionManager.renderAction("clearCanvas")}
            <RoomDialog
              isCollaborating={appState.isCollaborating}
              collaboratorCount={appState.collaborators.size}
              username={appState.username}
              onUsernameChange={onUsernameChange}
              onRoomCreate={onRoomCreate}
              onRoomDestroy={onRoomDestroy}
            />
          </Stack.Row>
          {actionManager.renderAction("changeViewBackgroundColor")}
        </Stack.Col>
      </Island>
    </Section>
  );

  const renderSelectedShapeActions = () => (
    <Section
      heading="selectedShapeActions"
      className={`zen-mode-transition ${zenModeEnabled && "transition-left"}`}
    >
      <Island className={CLASSES.SHAPE_ACTIONS_MENU} padding={4}>
        <SelectedShapeActions
          appState={appState}
          elements={elements}
          renderAction={actionManager.renderAction}
          elementType={appState.elementType}
        />
      </Island>
    </Section>
  );

  const closeLibrary = useCallback(
    (event) => {
      setAppState({ isLibraryOpen: false });
    },
    [setAppState],
  );

  const removeFromLibrary = useCallback(
    (indexToRemove) => {
      setAppState({
        library: appState.library.filter((_, index) => index !== indexToRemove),
      });
    },
    [appState, setAppState],
  );

  const renderFixedSideContainer = () => {
    const shouldRenderSelectedShapeActions = showSelectedShapeActions(
      appState,
      elements,
    );
    const libraryMenu = appState.isLibraryOpen ? (
      <LibraryMenu
        library={appState.library}
        onClickOutside={closeLibrary}
        onRemoveFromLibrary={removeFromLibrary}
        onInsertShape={onInsertShape}
      />
    ) : null;
    return (
      <FixedSideContainer side="top">
        <HintViewer appState={appState} elements={elements} />
        <div className="App-menu App-menu_top">
          <Stack.Col
            gap={4}
            className={zenModeEnabled && "disable-pointerEvents"}
          >
            {renderCanvasActions()}
            {shouldRenderSelectedShapeActions && renderSelectedShapeActions()}
          </Stack.Col>
          <Section heading="shapes">
            {(heading) => (
              <Stack.Col gap={4} align="start">
                <Stack.Row gap={1}>
                  <Island padding={1} className={zenModeEnabled && "zen-mode"}>
                    {heading}
                    <Stack.Row gap={1}>
                      <ShapesSwitcher
                        elementType={appState.elementType}
                        setAppState={setAppState}
                        isLibraryOpen={appState.isLibraryOpen}
                        hasLibrary={appState.library.length > 0}
                      />
                    </Stack.Row>
                  </Island>
                  <LockIcon
                    zenModeEnabled={zenModeEnabled}
                    checked={appState.elementLocked}
                    onChange={onLockToggle}
                    title={t("toolBar.lock")}
                  />
                </Stack.Row>
                {libraryMenu}
              </Stack.Col>
            )}
          </Section>
          <UserList
            className={`zen-mode-transition ${
              zenModeEnabled && "transition-right"
            }`}
          >
            {Array.from(appState.collaborators)
              // Collaborator is either not initialized or is actually the current user.
              .filter(([_, client]) => Object.keys(client).length !== 0)
              .map(([clientId, client]) => (
                <Tooltip
                  label={client.username || "Unknown user"}
                  key={clientId}
                >
                  {actionManager.renderAction("goToCollaborator", clientId)}
                </Tooltip>
              ))}
          </UserList>
        </div>
      </FixedSideContainer>
    );
  };

  const renderBottomAppMenu = () => {
    return (
      <div
        className={`App-menu App-menu_bottom zen-mode-transition ${
          zenModeEnabled && "App-menu_bottom--transition-left"
        }`}
      >
        <Stack.Col gap={2}>
          <Section heading="canvasActions">
            <Island padding={1}>
              <ZoomActions
                renderAction={actionManager.renderAction}
                zoom={appState.zoom}
              />
            </Island>
            {renderEncryptedIcon()}
          </Section>
        </Stack.Col>
      </div>
    );
  };

  const renderFooter = () => (
    <footer role="contentinfo" className="layer-ui__wrapper__footer">
      <div
        className={`zen-mode-transition ${
          zenModeEnabled && "transition-right disable-pointerEvents"
        }`}
      >
        <LanguageList
          onChange={async (lng) => {
            await setLanguage(lng);
            setAppState({});
          }}
          languages={languages}
          floating
        />
        {actionManager.renderAction("toggleShortcuts")}
      </div>
      <button
        className={`disable-zen-mode ${
          zenModeEnabled && "disable-zen-mode--visible"
        }`}
        onClick={toggleZenMode}
      >
        {t("buttons.exitZenMode")}
      </button>
      {appState.scrolledOutside && (
        <button
          className="scroll-back-to-content"
          onClick={() => {
            setAppState({
              ...calculateScrollCenter(elements, appState, canvas),
            });
          }}
        >
          {t("buttons.scrollBackToContent")}
        </button>
      )}
    </footer>
  );

  return isMobile ? (
    <MobileMenu
      appState={appState}
      elements={elements}
      actionManager={actionManager}
      exportButton={renderExportDialog()}
      setAppState={setAppState}
      onUsernameChange={onUsernameChange}
      onRoomCreate={onRoomCreate}
      onRoomDestroy={onRoomDestroy}
      onLockToggle={onLockToggle}
      canvas={canvas}
    />
  ) : (
    <div className="layer-ui__wrapper">
      {appState.isLoading && <LoadingMessage />}
      {appState.errorMessage && (
        <ErrorDialog
          message={appState.errorMessage}
          onClose={() => setAppState({ errorMessage: null })}
        />
      )}
      {appState.showShortcutsDialog && (
        <ShortcutsDialog
          onClose={() => setAppState({ showShortcutsDialog: null })}
        />
      )}
      {renderFixedSideContainer()}
      {renderBottomAppMenu()}
      {
        <aside
          className={`layer-ui__wrapper__github-corner zen-mode-transition ${
            zenModeEnabled && "transition-right"
          }`}
        >
          <GitHubCorner />
        </aside>
      }
      {renderFooter()}
    </div>
  );
};

const areEqual = (prev: LayerUIProps, next: LayerUIProps) => {
  const getNecessaryObj = (appState: AppState): Partial<AppState> => {
    const {
      draggingElement,
      resizingElement,
      multiElement,
      editingElement,
      isResizing,
      cursorX,
      cursorY,
      ...ret
    } = appState;
    return ret;
  };
  const prevAppState = getNecessaryObj(prev.appState);
  const nextAppState = getNecessaryObj(next.appState);

  const keys = Object.keys(prevAppState) as (keyof Partial<AppState>)[];

  return (
    prev.lng === next.lng &&
    prev.elements === next.elements &&
    keys.every((key) => prevAppState[key] === nextAppState[key])
  );
};

export default React.memo(LayerUI, areEqual);
