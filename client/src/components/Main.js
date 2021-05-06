import React from "react"
import Table from "./Table"
import logo from '../images/logo.png';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHome} from '@fortawesome/free-solid-svg-icons';
import {faGithub} from '@fortawesome/free-brands-svg-icons';

function Main() {
    return (    
        <section class="hero is-black is-fullheight">
        
            <div class="hero-head">
                <nav class="navbar">
                    <div class="container">
                        <div class="navbar-brand">
                            <a class="navbar-item" href="../">
                            <img src={logo} alt="Logo"/>
                            </a>
                            <span class="navbar-burger burger" data-target="navbarMenu">
                                <span></span>
                                <span></span>
                                <span></span>
                            </span>
                        </div>
                    <div id="navbarMenu" class="navbar-menu">
                        <div class="navbar-end">
                            <span class="navbar-item">
                                <a class="button is-white" href="../">
                                    <span class="icon">
                                        <FontAwesomeIcon icon={faHome} />
                                    </span>
                                    <span>Home</span>
                                </a>
                            </span>
                            <span class="navbar-item">
                               
                                <a class="button is-white" href="https://github.com/UZHBCON/deathnote">
                                    <span class="icon">
                                        <FontAwesomeIcon icon={faGithub} />
                                    </span>
                                    <span>View Source</span>
                                </a>
                            </span>
                        </div>
                    </div>
                </div>
            </nav>
        </div>

        <div class="hero-body">
            <div class="container">
                    <h1 class="title">
                        Contract
                    </h1>
                    <div class="columns is-gapless">
                        <div class="column is-2">
                            <p class="mr-2">Contract Address:</p>
                        </div>
                        <div class="control column">
                            <input class="input" type="text" disabled/>
                        </div>
                    </div>
                    <Table />
                </div>
            </div>
    </section>
    )
}

export default Main

