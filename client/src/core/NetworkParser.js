// -*- mode: rjsx;  -*-
// Copyright (C) 2021 Then Try This
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

class NetworkParser {

    constructor(nodes,edges) {
        this.nodes = nodes;
        this.edges = edges;        
		this.healthNodes = [];
        this.causeNodes = [];

		for (let node of nodes) {
            if (node.type=="health-wellbeing") {
                this.healthNodes.push(node);
            }
            if (node.type=="climate") {
                this.causeNodes.push(node);
		    }
        }
    }
    
    getHealthWellbeing() {
        return this.healthNodes;
    }

    searchNode(id) {
        for (let node of this.nodes) {
            if (node.node_id==id) {
                return node;
            }
        }
        console.log("could not find node: "+id);
        console.log(this.nodes);
        return null;
    }

    getPrediction(prediction,year,variable) {
        for (let p of prediction) {
            if (p.year==year) {
                return p[variable];
            }
        }
        return 0;
    }

    flipState(state) {
        if (state=="increase") {
            return "decrease";
        } else {
            return "increase";
        }
    }
    
    recurCalculate(node,state,fn) {
        node.state=state;       
        for (let edge of this.edges) {
            if (edge.node_from==node.node_id) {
                let child = this.searchNode(edge.node_to);
                if (edge.direction==0) {                
                    this.recurCalculate(child,state);
                } else {
                    this.recurCalculate(child,this.flipState(state));
                }                
            }        
        }
    }

    calculate(climatePrediction,year) {
        for (let cause of this.causeNodes) {
            if (this.getPrediction(climatePrediction,year,cause.variable)>0) {
                this.recurCalculate(cause,"increase");
            } else {
                this.recurCalculate(cause,"decrease");
            }
        }
    }
    
    calculateHealthWellbeing(climatePrediction,year) {
        console.log(climatePrediction);
        this.calculate(climatePrediction,year);
        return this.getHealthWellbeing();
    }

}


export { NetworkParser };