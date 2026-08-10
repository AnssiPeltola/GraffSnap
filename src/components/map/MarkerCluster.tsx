"use client";

import type { ReactNode } from "react";
import L from "leaflet";
import "leaflet.markercluster";

import {
  createElementObject,
  createLayerComponent,
  extendContext,
  type LeafletContextInterface,
} from "@react-leaflet/core";

type MarkerClusterProps = {
  children?: ReactNode;
  chunkedLoading?: boolean;
  disableClusteringAtZoom?: number;
  maxClusterRadius?: number | ((zoom: number) => number);
  spiderfyOnMaxZoom?: boolean;
};

function createMarkerClusterGroup(
  props: MarkerClusterProps,
  context: LeafletContextInterface,
) {
  const {
    children: _children,
    chunkedLoading,
    disableClusteringAtZoom,
    maxClusterRadius,
    spiderfyOnMaxZoom,
  } = props;

  const instance = L.markerClusterGroup({
    chunkedLoading,
    disableClusteringAtZoom,
    maxClusterRadius,
    spiderfyOnMaxZoom,
  });

  return createElementObject(
    instance,
    extendContext(context, {
      layerContainer: instance,
    }),
  );
}

const MarkerClusterGroup = createLayerComponent<
  L.MarkerClusterGroup,
  MarkerClusterProps
>(createMarkerClusterGroup);

export default MarkerClusterGroup;
