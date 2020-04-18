import * as yup from 'yup'
import { Formik } from 'formik'

import React, { Component, Fragment } from 'react';
import { TextInput, Text, Button, Alert } from 'react-native';

const defaultPerceptron = {
    threshold: 4,
    dots: [
        [0, 6],
        [1, 5],
        [3, 3],
        [2, 4],
    ],
    conditionArray: [0, 0, 0, 1],
    weights: [0, 0],
}

class Perceptron {
    constructor({threshold, dots, conditionArray, weights}) {
        this.threshold = threshold;
        this.dots = dots;
        this.weights = weights;
        this.conditionArray = conditionArray;
    }

    updateWeights = (y, dot, currentWeights, learningSpeed) => {
        const delta = this.countDelta(y);
        return currentWeights.map((weight, index) => weight + delta * learningSpeed * dot[index]);
    }

    isFit = (dot, index, weights, y=undefined) => {
        const condition = this.conditionArray[index];
        if(!y)
            y = this.countY(dot, weights);

        return condition ? y > this.threshold : y < this.threshold;
    }

    countY = (dot, weights) => dot.reduce((prev, current, index) => prev + current * weights[index], 0);
    countDelta = y => this.threshold - y;
    message = (message, weights) => ({message, weights});

    handler(learningSpeed, deadline, iterationsCount){
        let currentWeights = [...this.weights];

        const start = new Date();
        for (let i = 0; i < iterationsCount; i++) {
            for (let j = 0; j < this.dots.length; j++) {
                const dot = this.dots[j];
                const y = this.countY(this.dots[j], currentWeights);
                if(this.isFit(dot, j, currentWeights, y)) {
                    const isStop = this.dots.every((dot, index) =>
                        this.isFit(dot, index, currentWeights));
                    if(isStop)
                        return this.message("Success!", currentWeights);
                }
                currentWeights = this.updateWeights(y, dot, currentWeights, learningSpeed);
                console.log(currentWeights);
            }
            const finish = new Date();
            let timeDiff = finish - start; //in ms
            // strip the ms
            timeDiff /= 1000;
            // get seconds
            timeDiff = Math.round(timeDiff);
            if(timeDiff > deadline)
                return this.message("Error: Deadline is out!", currentWeights);
        }
        return this.message("Success: Iteration finished!", currentWeights);
    }
}

export default class App extends Component {
    state = {
        weights: [],
    }
    perceptron = new Perceptron(defaultPerceptron);

    onSubmitHandler = ({learningSpeed, deadline, iterationsCount}) => {
        const {message, weights} = this.perceptron.handler(learningSpeed, deadline, iterationsCount);
        Alert.alert(message);
        this.setState({weights: weights});
    };

    render() {
        return (
            <Formik
                initialValues={{ learningSpeed: 0.01, deadline: 0.5, iterationsCount:100 }}
                onSubmit={this.onSubmitHandler}
                validationSchema={yup.object().shape({
                    learningSpeed: yup
                        .number()
                        .positive('Please provide positive number')
                        .required(),

                    deadline: yup
                        .number()
                        .positive('Please provide positive number')
                        .required(),

                    iterationsCount: yup
                        .number()
                        .positive('Please provide positive number')
                        .integer('Please provide positive integer')
                        .required(),
                })}
            >
                {({ values, handleChange, errors, setFieldTouched, touched, isValid, handleSubmit }) => (
                    <Fragment>
                        <Text>Labwork #3.2: Perceptron Model.</Text>
                        <TextInput
                            value={values.learningSpeed}
                            onChangeText={handleChange('learningSpeed')}
                            placeholder="Learning speed"
                            onBlur={() => setFieldTouched('learningSpeed')}
                        />
                        {touched.learningSpeed && errors.learningSpeed &&
                        <Text style={{ fontSize: 10, color: 'red' }}>{errors.learningSpeed}</Text>
                        }

                        <TextInput
                            value={values.deadline}
                            onChangeText={handleChange('deadline')}
                            placeholder="Deadline in a seconds"
                            onBlur={() => setFieldTouched('deadline')}
                        />
                        {touched.deadline && errors.deadline &&
                        <Text style={{ fontSize: 10, color: 'red' }}>{errors.deadline}</Text>
                        }

                        <TextInput
                            value={values.iterationsCount}
                            onChangeText={handleChange('iterationsCount')}
                            placeholder="Iterations steps."
                            onBlur={() => setFieldTouched('iterationsCount')}
                        />
                        {touched.iterationsCount && errors.iterationsCount &&
                        <Text style={{ fontSize: 10, color: 'red' }}>{errors.iterationsCount}</Text>
                        }
                        <Text>Weights: {this.state.weights.toString()}</Text>

                        <Button
                            title='Sign In'
                            disabled={!isValid}
                            onPress={handleSubmit}
                        />
                    </Fragment>
                )}
            </Formik>
        );
    }
}

