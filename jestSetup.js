jest.mock('@react-native-async-storage/async-storage', () => {
  return require('@react-native-async-storage/async-storage/jest/async-storage-mock');
});

jest.mock('react-native-gesture-handler', () => ({
  // Mock only what you use, or provide empty components/functions
  Swipeable: jest.fn(),
  DrawerLayout: jest.fn(),
  State: {},
  PanGestureHandler: jest.fn(),
  TapGestureHandler: jest.fn(),
  LongPressGestureHandler: jest.fn(),
  FlingGestureHandler: jest.fn(),
  ForceTouchGestureHandler: jest.fn(),
  PinchGestureHandler: jest.fn(),
  RotationGestureHandler: jest.fn(),
  Directions: {},
  GestureHandlerRootView: ({ children }) => children,
}));
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockMapView = (props) => <View {...props} />;
  const MockMarker = (props) => <View {...props} />;
  const MockPolyline = (props) => <View {...props} />;
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    Polyline: MockPolyline,
    PROVIDER_GOOGLE: 'google',
  };
});