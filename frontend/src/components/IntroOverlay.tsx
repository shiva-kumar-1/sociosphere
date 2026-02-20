import { motion, Variants } from "framer-motion";
import logo from "../assets/sociosphere-logo.png";

const text = "SocioSphere";

/* FIXED TYPES */
const container: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const letter: Variants = {
    hidden: {
        opacity: 0,
        x: -15,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1], // FIXED easing (cubic bezier)
        },
    },
};

export default function IntroOverlay() {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={styles.overlay}
        >
            <div style={{ textAlign: "center" }}>
                <motion.img
                    src={logo}
                    alt="logo"
                    initial={{ x: -80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{
                        duration: 0.6,
                        ease: [0.25, 0.1, 0.25, 1], // FIXED
                    }}
                    style={{ width: "200px", margin: "0 auto" }}
                />

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="visible"
                    style={styles.textWrapper}
                >
                    {text.split("").map((char, index) => (
                        <motion.span
                            key={index}
                            variants={letter}
                            style={styles.letter}
                        >
                            {char}
                        </motion.span>
                    ))}
                </motion.div>
            </div>
        </motion.div>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: `
      radial-gradient(circle at 20% 30%, rgba(0,212,255,0.15), transparent 40%),
      radial-gradient(circle at 80% 70%, rgba(168,85,247,0.15), transparent 40%),
      #0f172a
    `,
        zIndex: 9999,
    } as React.CSSProperties,

    textWrapper: {
        marginTop: "16px",
        display: "flex",
        justifyContent: "center",
    } as React.CSSProperties,

    letter: {
        fontSize: "28px",
        fontWeight: 600,
        color: "#ffffff",
        marginRight: "2px",
    } as React.CSSProperties,
};