interface SkeletonProps {
    width?: string;
    height?: string;
    borderRadius?: string;
    style?: React.CSSProperties;
}

export default function Skeleton({
    width = "100%",
    height = "16px",
    borderRadius,
    style,
}: SkeletonProps) {
    return (
        <div
            className="skeleton"
            style={{
                width,
                height,
                borderRadius,
                flexShrink: 0,
                ...style,
            }}
        />
    );
}

