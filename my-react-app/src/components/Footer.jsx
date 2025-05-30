import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Linkedin, Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import './footer.css'; // Assuming this is the path to your provided CSS

const Footer = () => {
    const teamMembers = [
        {
            name: 'Abhiram',
            instagram: 'https://www.instagram.com/no username?igsh',
            linkedin: 'https://www.linkedin.com/in/abhiram-reddy-muthyala?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app', // Replace with actual LinkedIn profile URL
        },
        {
            name: 'Bhavik',
            instagram: 'https://www.instagram.com/bhavikraj19?igsh=MWgxNXhnd2ZveDl0NA==',
            linkedin: 'https://www.linkedin.com/in/bhavik-linkedin-profile/', // Replace with actual LinkedIn profile URL
        },
        {
            name: 'Pranav',
            instagram: 'https://www.instagram.com/pranavgoud__?igsh=a3kzNnd6cmRzZW9t',
            linkedin: 'https://www.linkedin.com/in/pranav-linkedin-profile/', // Replace with actual LinkedIn profile URL
        },
        {
            name: 'Pranith',
            instagram: 'https://www.instagram.com/pranith.reddy__?igsh=ZXAzZmp4YW9ybG5j',
            linkedin: 'https://www.linkedin.com/in/pranith-linkedin-profile/', // Replace with actual LinkedIn profile URL
        },
        {
            name: 'Sathvik',
            instagram: 'https://www.instagram.com/sathvikreddy._/profilecard/?igsh=NjB0bXA5cmkzNXc5',
            linkedin: 'https://www.linkedin.com/in/sathvik-reddy-7b730a322?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app', // Replace with actual LinkedIn profile URL
        },
    ];

    return (
        <footer className="tech-footer">
            <div className="container">
                <div className="footer-content" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div className="footer-brand" style={{ marginBottom: '30px', maxWidth: '100%' }}>
                        <h3 className="footer-title">Keto Warrior</h3>
                        <p className="footer-description">
                            Connect with the team!
                        </p>
                    </div>
                    <div className="team-profiles" style={{ marginBottom: '20px' }}>
                        <h4 className="link-group-title" style={{ marginBottom: '10px' }}>Meet the Team</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
                            {teamMembers.map((member, index) => (
                                <li key={index} style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#a0aec0', marginBottom: '5px' }}>{member.name}</span>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {member.instagram && (
                                                <motion.a
                                                    href={member.instagram}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="social-link"
                                                    whileHover={{ y: -3 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    style={{ color: '#cbd5e0', textDecoration: 'none' }}
                                                >
                                                    <Instagram size={20} />
                                                </motion.a>
                                            )}
                                            {member.linkedin && (
                                                <motion.a
                                                    href={member.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="social-link"
                                                    whileHover={{ y: -3 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    style={{ color: '#cbd5e0', textDecoration: 'none' }}
                                                >
                                                    <Linkedin size={20} />
                                                </motion.a>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="link-group" style={{ minWidth: 'auto', marginBottom: '20px', marginTop: '30px' }}>
                        <ul>
                            <li>
                                <Link to="/contact" className="footer-link">Contact Us</Link> with your pull request at our{' '}
                                <motion.a
                                    href="https://github.com/sathvikreddy369/keto3.git"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#00b4d8', textDecoration: 'none', fontWeight: 'bold' }}
                                    whileHover={{ color: '#00c896' }}
                                >
                                    GitHub Repo
                                </motion.a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p className="copyright">
                        © {new Date().getFullYear()} Keto Warrior.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;