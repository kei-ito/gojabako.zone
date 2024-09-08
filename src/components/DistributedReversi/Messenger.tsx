import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRecoilCallback } from "recoil";
import { toRecoilSelectorOpts } from "../../util/recoil/selector.mts";
import { SecondaryButton } from "../Button";
import { rcCell, rcSelectedCoordinates } from "./recoil.app.mts";
import { sendDRMessage } from "./recoil.send.mts";
import { DRSelector } from "./Selector";
import * as style from "./style.module.scss";
import type {
  DRMessage,
  DRMessageMode,
  DRMessageType,
  DRPlayerId,
  DRSharedState,
} from "./util.mts";
import {
  DRDiagonalDirections,
  DRDirections,
  DRMessagePayloadTypes,
  DRMessageTypes,
  generateMessageProps,
} from "./util.mts";

const messageModes = [
  "spread",
  ...DRDirections,
  ...DRDiagonalDirections,
] as const;

export const DRMessenger = () => {
  const [type, setType] = useState<DRMessageType>("setShared");
  const [mode, setMode] = useState<DRMessageMode>("spread");
  const [sharedState, setSharedState] = useState({
    playerCount: 2,
    state: 0 as DRPlayerId,
  });
  const send = useSendFromSelectedCells();
  const sendMessage = useCallback(() => {
    switch (type) {
      case "reversi2":
        send({ ...generateMessageProps(), type, mode, payload: null });
        break;
      default:
        send({ ...generateMessageProps(), type, mode, payload: sharedState });
    }
  }, [send, type, mode, sharedState]);
  const payloadType = DRMessagePayloadTypes[type];
  return (
    <>
      <div>メッセージを送信</div>
      <MessageModeSelector defaultValue={mode} onChange={setMode} />
      <MessageTypeSelector defaultValue={type} onChange={setType} />
      {payloadType === "shared" && (
        <SharedStateInputs
          defaultValue={sharedState}
          onChange={setSharedState}
        />
      )}
      <SecondaryButton icon="outgoing_mail" onClick={sendMessage}>
        送信
      </SecondaryButton>
    </>
  );
};

const useSendFromSelectedCells = () =>
  useRecoilCallback(
    (cbi) => (msg: DRMessage) => {
      const rso = toRecoilSelectorOpts(cbi);
      for (const cellId of rso.get(rcSelectedCoordinates)) {
        const cell = rso.get(rcCell(cellId));
        if (cell) {
          sendDRMessage(rso, cellId, msg);
        }
      }
    },
    [],
  );

interface SelectorProps<T extends string> {
  onChange: (value: T) => void;
  defaultValue: T;
}

const MessageTypeSelector = ({
  onChange,
  defaultValue,
}: SelectorProps<DRMessageType>) => {
  return (
    <DRSelector<DRMessageType>
      id="MessageType"
      label="msg.type"
      values={DRMessageTypes}
      defaultValue={defaultValue}
      onChange={useCallback(
        (value) => {
          if (DRMessageTypes.includes(value as DRMessageType)) {
            onChange(value as DRMessageType);
          }
        },
        [onChange],
      )}
    />
  );
};

const MessageModeSelector = ({
  onChange,
  defaultValue,
}: SelectorProps<DRMessageMode>) => {
  return (
    <DRSelector<DRMessageMode>
      id="MessageMode"
      label="msg.mode"
      values={messageModes}
      defaultValue={defaultValue}
      onChange={useCallback(
        (value) => {
          if (messageModes.includes(value as DRMessageMode)) {
            onChange(value as DRMessageMode);
          }
        },
        [onChange],
      )}
    />
  );
};

interface SharedStateInputsProps {
  defaultValue: DRSharedState;
  onChange: (sharedState: DRSharedState) => void;
}

const SharedStateInputs = ({
  onChange,
  defaultValue,
}: SharedStateInputsProps) => {
  const [sharedState, setSharedState] = useState(defaultValue);
  useEffect(() => onChange(sharedState), [onChange, sharedState]);
  const { playerCount } = sharedState;
  const playerIds = useMemo(() => {
    const ids: Array<DRPlayerId> = [];
    for (let i = 0; i < playerCount; i++) {
      ids.push(i as DRPlayerId);
    }
    return ids;
  }, [playerCount]);
  return (
    <>
      <section className={style.number}>
        <label htmlFor="PayloadPlayerCount">playerCount</label>
        <input
          id="PayloadPlayerCount"
          type="number"
          step={1}
          min={2}
          value={playerCount}
          onChange={useCallback((e: ChangeEvent<HTMLInputElement>) => {
            const count = Number(e.currentTarget.value);
            setSharedState((current) => ({ ...current, playerCount: count }));
          }, [])}
        />
      </section>
      <DRSelector<DRPlayerId>
        id="PayloadState"
        label="state"
        values={playerIds}
        defaultValue="0"
        onChange={useCallback((value: string) => {
          setSharedState((c) => ({ ...c, state: Number(value) as DRPlayerId }));
        }, [])}
      />
    </>
  );
};
