import * as THREE from "three";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CollisionEnterPayload,
  RigidBody,
  RigidBodyApi,
} from "@react-three/rapier";

import { Die } from "../types/Die";
import { getValueFromDiceGroup } from "../helpers/getValueFromDiceGroup";
import { useFrame } from "@react-three/fiber";
import { useAudioListener } from "../audio/AudioListenerProvider";
import { getNextBuffer } from "../audio/getAudioBuffer";
import { PhysicalMaterial } from "../types/PhysicalMaterial";
import { getDieWeightClass } from "../helpers/getDieWeightClass";
import { getDieDensity } from "../helpers/getDieDensity";
import { DiceThrow } from "../types/DiceThrow";
import { DiceTransform } from "../types/DiceTransform";
import { DiceCollider } from "../colliders/DiceCollider";

/** Minium linear and angular speed before the dice roll is considered finished */
const MIN_ROLL_FINISHED_SPEED = 0.05;
/** Cool down in MS before dice audio can get played again */
const AUDIO_COOLDOWN = 200;

function magnitude({ x, y, z }: { x: number; y: number; z: number }) {
  return Math.sqrt(x * x + y * y + z * z);
}

type Vector3Array = [number, number, number];

export function PhysicsDice({
  die,
  dieThrow,
  dieValue,
  dieTransform,
  onRollFinished,
  children,
  ...props
}: JSX.IntrinsicElements["group"] & {
  die: Die;
  dieThrow: DiceThrow;
  dieValue: number | null;
  dieTransform: DiceTransform | null;
  onRollFinished?: (
    id: string,
    number: number,
    transform: DiceTransform
  ) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const rigidBodyRef = useRef<RigidBodyApi>(null);

  // Convert dice throw into THREE values
  const [position] = useState<Vector3Array>(() => {
    const p = dieTransform ? dieTransform.position : dieThrow.position;
    return [p.x, p.y, p.z];
  });

  const [rotation] = useState<Vector3Array>(() => {
    const r = dieTransform ? dieTransform.rotation : dieThrow.rotation;
    const quaternion = new THREE.Quaternion(r.x, r.y, r.z, r.w);
    const euler = new THREE.Euler().setFromQuaternion(quaternion);
    return [euler.x, euler.y, euler.z];
  });

  const [linearVelocity] = useState<Vector3Array>(() => {
    const v = dieTransform ? { x: 0, y: 0, z: 0 } : dieThrow.linearVelocity;
    return [v.x, v.y, v.z];
  });

  const [angularVelocity] = useState<Vector3Array>(() => {
    const v = dieTransform ? { x: 0, y: 0, z: 0 } : dieThrow.angularVelocity;
    return [v.x, v.y, v.z];
  });

  const lockDice = useCallback(() => {
    const rigidBody = rigidBodyRef.current;
    if (rigidBody) {
      // Disable rigid body rotation and translation
      // This stops the dice from getting changed after it has finished rolling
      rigidBody.setEnabledRotations(false, false, false);
      rigidBody.setAngvel({ x: 0, y: 0, z: 0 });
      rigidBody.setEnabledTranslations(false, false, false);
      rigidBody.setLinvel({ x: 0, y: 0, z: 0 });
    }
  }, []);

  const checkRollFinished = useCallback(() => {
    const rigidBody = rigidBodyRef.current;
    const group = ref.current;
    if (rigidBody && dieValue === null && group) {
      // Get the total speed for the dice
      const linVel = rigidBody.linvel();
      const angVel = rigidBody.angvel();
      const speed = magnitude(linVel) + magnitude(angVel);
      // Ensure that the dice is in the tray
      const validPosition = rigidBody.translation().y < 1.5;
      if (speed < MIN_ROLL_FINISHED_SPEED && validPosition) {
        const value = getValueFromDiceGroup(group);
        const position = rigidBody.translation();
        const rotation = rigidBody.rotation();
        const transform = {
          position: { x: position.x, y: position.y, z: position.z },
          rotation: {
            x: rotation.x,
            y: rotation.y,
            z: rotation.z,
            w: rotation.w,
          },
        };
        onRollFinished?.(die.id, value, transform);
        lockDice();
      }
    }
  }, [die.id, dieValue, lockDice]);

  // Lock the dice when we have a manual transform
  useEffect(() => {
    if (dieTransform) {
      lockDice();
    }
  }, [dieTransform]);

  useFrame(checkRollFinished);

  const listener = useAudioListener();
  const lastAudioTimeRef = useRef(0);
  function handleCollision({ rigidBodyObject }: CollisionEnterPayload) {
    if (performance.now() - lastAudioTimeRef.current < AUDIO_COOLDOWN) {
      return;
    }
    const group = ref.current;
    // TODO: remove conditional when this gets merged https://github.com/pmndrs/react-three-rapier/pull/151/commits
    const physicalMaterial: PhysicalMaterial =
      rigidBodyObject?.userData?.material || "LEATHER";
    const linvel = rigidBodyRef.current?.linvel();
    if (group && physicalMaterial && linvel) {
      const speed = magnitude(linvel);
      const weightClass = getDieWeightClass(die);
      const buffer = getNextBuffer(weightClass, physicalMaterial);
      if (buffer) {
        const sound = new THREE.PositionalAudio(listener);
        sound.setBuffer(buffer);
        sound.setRefDistance(3);
        sound.play();
        // Modulate sound volume based off of the speed of the colliding dice
        sound.setVolume(Math.min(speed / 5, 1));
        sound.onEnded = () => {
          group.remove(sound);
        };
        group.add(sound);
        lastAudioTimeRef.current = performance.now();
      }
    }
  }

  const userData = useMemo(
    () => ({ material: "DICE", dieId: die.id }),
    [die.id]
  );

  return (
    <RigidBody
      // Increase gravity on the dice to offset the non-standard dice size.
      // Dice are around 10x larger then they should be to account for
      // physics errors when shown at proper size.
      gravityScale={2}
      density={getDieDensity(die)}
      friction={0.1}
      position={position}
      rotation={rotation}
      linearVelocity={linearVelocity}
      angularVelocity={angularVelocity}
      ref={rigidBodyRef}
      onCollisionEnter={handleCollision}
      userData={userData}
    >
      <group ref={ref} {...props}>
        <DiceCollider diceType={die.type} />
        {children}
      </group>
    </RigidBody>
  );
}