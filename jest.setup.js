require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-reanimated', () => {
	const React = require('react');

	const api = {
		useSharedValue: initial => ({ value: initial }),
		useAnimatedStyle: updater => updater(),
		withTiming: value => value,
		withSpring: value => value,
		runOnJS: fn => fn,
		createAnimatedComponent: Component => props => React.createElement(Component, props),
	};

	return {
		__esModule: true,
		default: api,
		...api,
	};
});

jest.mock('@react-navigation/native', () => {
	const React = require('react');
	const { View } = require('react-native');

	return {
		NavigationContainer: ({ children }) => React.createElement(View, null, children),
		useNavigation: () => ({ navigate: jest.fn(), setOptions: jest.fn() }),
		useRoute: () => ({ params: {} }),
		useFocusEffect: effect => effect(),
		createNavigationContainerRef: () => ({ current: null }),
	};
});

jest.mock('@react-navigation/stack', () => {
	const React = require('react');

	const Navigator = ({ children }) => React.createElement(React.Fragment, null, children);
	const Screen = () => null;

	return {
		createStackNavigator: () => ({ Navigator, Screen }),
		CardStyleInterpolators: {},
	};
});

jest.mock('@react-navigation/bottom-tabs', () => {
	const React = require('react');

	const Navigator = ({ children }) => React.createElement(React.Fragment, null, children);
	const Screen = () => null;

	return {
		createBottomTabNavigator: () => ({ Navigator, Screen }),
	};
});

jest.mock('@react-native-async-storage/async-storage', () => {
	let storage = {};

	return {
		__esModule: true,
		default: {
			getItem: jest.fn(async key => (key in storage ? storage[key] : null)),
			setItem: jest.fn(async (key, value) => {
				storage[key] = value;
			}),
			removeItem: jest.fn(async key => {
				delete storage[key];
			}),
			multiSet: jest.fn(async entries => {
				entries.forEach(([key, value]) => {
					storage[key] = value;
				});
			}),
			multiGet: jest.fn(async keys => keys.map(key => [key, key in storage ? storage[key] : null])),
			multiRemove: jest.fn(async keys => {
				keys.forEach(key => {
					delete storage[key];
				});
			}),
			clear: jest.fn(async () => {
				storage = {};
			}),
		},
	};
});