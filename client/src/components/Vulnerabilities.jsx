// Copyright (C) 2022 Then Try This
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the Common Good Public License Beta 1.0 as
// published at http://www.cgpl.org
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// Common Good Public License Beta 1.0 for more details.

import React, { useEffect, useState, lazy, Suspense } from 'react';

import { ReactComponent as HealthAndWellbeingSvg } from '../images/icons/Public health & wellbeing.svg';
import { andify } from '../utils/utils';
import { nfviColumns } from '../core/climatejust';
import LoadingOverlay from "react-loading-overlay";
import VulnerabilitiesLoader from './VulnerabilitiesLoader';

import './Vulnerabilities.css';

function Vulnerabilities(props) {

    const [ vulnerabilities, setVulnerabilities ] = useState([]);
    const [ decile, setDecile ] = useState("dec_1");
    const [ loading, setLoading ] = useState(false);

    function flipDecile(decile) {
        if (decile=="dec_1") return "dec_9";
        if (decile=="dec_2") return "dec_8";
        if (decile=="dec_3") return "dec_7";
        if (decile=="dec_4") return "dec_6";
        if (decile=="dec_5") return "dec_5";
        if (decile=="dec_6") return "dec_4";
        if (decile=="dec_7") return "dec_3";
        if (decile=="dec_8") return "dec_2";
        return "dec_1";
    }

    function decileToText(decile) {
        if (decile=="dec_1") return "10%";
        if (decile=="dec_2") return "20%";
        if (decile=="dec_3") return "30%";
        if (decile=="dec_4") return "40%";
        if (decile=="dec_5") return "50%";
        if (decile=="dec_6") return "60%";
        if (decile=="dec_7") return "70%";
        if (decile=="dec_8") return "80%";
        return "90%";
    }
        
    if (props.regions.length === 0) {
        return null;
    }

    return (
        <div>
          <VulnerabilitiesLoader 
            regions = {props.regions}
            regionType = {props.regionType}
            callback = {data => {
                let vulns = [];
                for (let key of Object.keys(data[0])) {
                    let avg = data[0][key];
                    let statkey = props.regionType+"_vulnerabilities_"+key;
                    let comparison = props.stats[statkey+"_"+decile];
                     
                    let significant = true;
                    if (comparison!=undefined) {                        
                        significant = false;
                        if (nfviColumns[key].direction=="less-than") {
                            comparison = props.stats[statkey+"_"+flipDecile(decile)];
                            if (avg<comparison) {
                                significant = true;
                            }
                        } else {
                            if (avg>comparison) {
                                significant = true;
                            }
                        }
                    }

                    if (key=="imd_rank" || key=="imd_decile") {
                        vulns.push({
                            key: key,
                            type: "Index of Multiple Deprivation",
                            name: nfviColumns[key].name+" "+data[0][key].toFixed(),                        
                            region: 0,
                            uk: 0,
                            icon: lazy(() => import('../icons/vulnerabilities/'+key)),
                        });
                    } else {                    
                        if (significant) {
                            vulns.push({
                                key: key,
                                type: "Climate Just NFVI Supporting Variables",
                                name: nfviColumns[key].name,                        
                                region: data[0][key],
                                uk: props.stats[statkey+"_avg"],
                                icon: lazy(() => import('../icons/vulnerabilities/'+key)),
                            });
                        }
                    }
                }
                setVulnerabilities(vulns);
            }}
            loadingCallback={ loading => { setLoading(loading); }}            
          />
            
          
          <LoadingOverlay
            active={loading}
            spinner
            text={'Loading...'}>
            <h1>Vulnerabilities</h1>
            <p>
              The following vulnerabilities are the most important to consider in&nbsp; 
              
              <span className={"projected-regions"}>
                { andify(props.regions.map(e => e.name)) }
              </span>
              
              &nbsp;(these vulnerabilities are in the top

              <select onChange={(e) => { setDecile(e.target.value); }}>
                <option value="dec_1">10%</option>
                <option value="dec_2">20%</option>
                <option value="dec_3">30%</option>
                <option value="dec_4">40%</option>
                <option value="dec_5">50%</option>
                <option value="dec_6">60%</option>
                <option value="dec_7">70%</option>
                <option value="dec_8">80%</option>
                <option value="dec_9">90%</option>
              </select>

              compared with UK averages).
            </p>
            
            <div className={"vuln-container"}>        
              {vulnerabilities.length ? vulnerabilities.map(
                  v => {
                      return (
                          <div className={"vuln"}>
                            <Suspense fallback={<div>Loading icon...</div>}>
                              <v.icon/>
                            </Suspense>
                            <div className={"vuln-name"}>{v.name}</div>                      
                            <div className={"vuln-type"}>{v.type}</div>
                            {!v.name.startsWith("IMD") &&
                             <div className={"vuln-type"}>{v.region.toFixed(2)}% vs {v.uk.toFixed(2)}% UK average</div>
                            }
                          </div>
                      );
                  }) : <h3>{ andify(props.regions.map(e => e.name)) } is not in the top {decileToText(decile)} for any vulnerabilities.</h3>}
            </div>  
	        <p>
		      Source data on vulnerabilities from <a href="https://www.climatejust.org.uk">ClimateJust</a> based on work carried out by <a href="http://www.sayersandpartners.co.uk/uploads/6/2/0/9/6209349/sayers_2017_-_present_and_future_flood_vulnerability_risk_and_disadvantage_-_final_report_-_uploaded_05june2017_printed_-_high_quality.pdf">Sayers and Partners LLP for the Joseph Rowntree Foundation</a>.
	        </p>
          </LoadingOverlay>
        </div>
    );
}

export default Vulnerabilities;
