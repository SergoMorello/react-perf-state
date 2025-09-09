import type { Configuration } from 'webpack';
import path from 'path';

const config: Configuration = {
	entry: {
		index: '/src/index.ts',
	},
	target: 'web',
	mode: 'production',
	devtool: "source-map",
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: [
					'ts-loader'
				],
				exclude: /node_modules/,
			}
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},

	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
		library: 'PerfState',
		libraryTarget: 'umd',
		auxiliaryComment: 'Performance states with queues for React'
	},

	externals: {
		react: {
			root: 'React',
			commonjs: 'react',
			commonjs2: 'react',
			amd: 'react',
		},
		'react/jsx-runtime': {
			root: 'React',
			commonjs: 'react/jsx-runtime',
			commonjs2: 'react/jsx-runtime',
			amd: 'react/jsx-runtime'
		}
	}
};

export default config;